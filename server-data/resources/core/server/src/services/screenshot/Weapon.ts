import { wait } from "@shared/index";

import gameData from "../../../../gamedata.json";

import type { CommandParseResult } from "../../interfaces/Screenshot";
import type { Events, EventSource } from "../../types/Events";
import { EventsService } from "../Events";
import { GameEventProvider } from "../events/GameEvents";
import { WebEventProvider } from "../events/WebEvents";
import { emitClient, getProcessingPlayer } from "../../helpers/Player";
import { BaseScreenshotService } from "./_Base";
import type { WeaponProcessData } from "$/shared/src/index";

export class WeaponScreenshotService extends BaseScreenshotService {
  private _isProcessing: boolean = false;
  private eventService: EventsService;
  private dataToProcess: WeaponProcessData = {
    model: "all",
  };

  public get isProcessing(): boolean {
    return this._isProcessing;
  }

  constructor() {
    super("weapon");
  }

  public async process(): Promise<void> {
    this._isProcessing = true;
    this.eventService = new EventsService({
      game: new GameEventProvider(),
      web: new WebEventProvider(),
    });

    this.eventService.on("processComplete", this.onProcessEnded.bind(this));
    this.eventService.on("skip", this.onSkip.bind(this));

    await this.startProcessing();
    this.eventService.destroy();
  }

  public cleanup(): void {
    this._isProcessing = false;
  }

  public parseCommandData(data: string[]): CommandParseResult {
    const [model] = data;

    if (model && model !== "all") {
      this.dataToProcess.model = model.split(",");
    }

    return { success: true };
  }

  //
  // Ami szamit lol
  //

  private processIndex = 0;
  private waitForResult: ReturnType<typeof Promise.withResolvers> | null = null;

  private weaponModelsToProcess: string[];
  private currentModel: string;

  private async startProcessing() {
    this.processIndex = 0;

    let player = getProcessingPlayer();
    while (!player) {
      await wait(1000);

      player = getProcessingPlayer();
      console.log("Waiting for player to be ready...");
    }

    emitClient("Screenshot::Setup", player, {
      type: "weapon",
      data: {},
    });

    this.weaponModelsToProcess = typeof this.dataToProcess.model === "string" ? gameData.weapons : this.dataToProcess.model;

    for (const weaponModel of this.weaponModelsToProcess) {
      await this.processWeapon(weaponModel, player);
      this.processIndex++;
    }

    await this.postProcessImages();

    this.cleanup();
  }

  private async processWeapon(model: string, withPlayer: string) {
    if (GetPlayerEndpoint(withPlayer) === null) {
      console.log("Player disconnected. Stopping process...");
      return;
    }

    this.waitForResult = Promise.withResolvers();
    this.currentModel = model;

    emitClient("Screenshot::Process", withPlayer, { model });

    await this.waitForResult.promise;
  }

  private async onSkip(data: Events["skip"], source: EventSource): Promise<void> {
    this.waitForResult?.resolve(true);
  }

  private async onProcessEnded(data: Events["processComplete"], source: EventSource): Promise<void> {
    console.log(
      `Weapon screenshot for model ${this.currentModel} processed successfully. (${this.processIndex + 1} / ${
        this.weaponModelsToProcess.length
      })`
    );

    await this.saveImageUrlToFile(this.currentModel, data.imageData);
    this.waitForResult?.resolve(true);
  }
}
