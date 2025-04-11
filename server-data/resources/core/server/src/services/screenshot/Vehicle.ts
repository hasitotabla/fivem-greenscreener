import fs from "fs";
import path from "path";

import { wait, type VehicleProcessData } from "@shared/index";

import gameData from "../../../../gamedata.json";

import type { CommandParseResult } from "../../interfaces/Screenshot";
import type { Events, EventSource } from "../../types/Events";
import { EventsService } from "../Events";
import { GameEventProvider } from "../events/GameEvents";
import { WebEventProvider } from "../events/WebEvents";
import { emitClient, getProcessingPlayer } from "../../helpers/Player";
import { BaseScreenshotService } from "./_Base";

export class VehicleScreenshotService extends BaseScreenshotService {
  private _isProcessing: boolean = false;
  private eventService: EventsService;
  private dataToProcess: VehicleProcessData = {
    model: "all",
    colors: { primary: 0, secondary: 0 },
  };

  public get isProcessing(): boolean {
    return this._isProcessing;
  }

  public async process(): Promise<void> {
    this._isProcessing = true;
    this.eventService = new EventsService({
      game: new GameEventProvider(),
      web: new WebEventProvider(),
    });

    this.eventService.on("processComplete", this.onProcessEnded.bind(this));
    this.eventService.on("skip", this.onSkip.bind(this));

    this.startProcessing();
  }

  public cleanup(): void {
    this._isProcessing = false;
  }

  public parseCommandData(data: string[]): CommandParseResult {
    const [model, primaryColor, secondaryColor] = data;

    if (model && model !== "all") {
      this.dataToProcess.model = model.split(",");
    }

    this.dataToProcess.colors = {
      primary: parseInt(primaryColor ?? "0"),
      secondary: parseInt(secondaryColor ?? "0"),
    };

    return { success: true };
  }

  //
  // Ami szamit lol
  //

  private processIndex = 0;
  private waitForResult: ReturnType<typeof Promise.withResolvers> | null = null;

  private vehicleModelsToProcess: string[];
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
      type: "vehicle",
      data: {},
    });

    this.vehicleModelsToProcess = typeof this.dataToProcess.model === "string" ? gameData.vehicles : this.dataToProcess.model;

    for (const vehicleModel of this.vehicleModelsToProcess) {
      await this.processVehicle(vehicleModel, player);
      this.processIndex++;
    }

    await this.postProcessImages();

    this.cleanup();
  }

  private async processVehicle(model: string, withPlayer: string) {
    if (GetPlayerEndpoint(withPlayer) === null) {
      console.log("Player disconnected. Stopping process...");
      return;
    }

    this.waitForResult = Promise.withResolvers();

    this.currentModel = model;

    emitClient("Screenshot::Process", withPlayer, {
      model,
      colors: this.dataToProcess.colors,
    });

    await this.waitForResult.promise;
  }

  private async onSkip(data: Events["skip"], source: EventSource): Promise<void> {
    console.log(`Skipping vehicle...`);
    this.waitForResult?.resolve(true);
  }

  private async onProcessEnded(data: Events["processComplete"], source: EventSource): Promise<void> {
    this.saveImageUrlToFile(data.imageData);
  }

  private async saveImageUrlToFile(imageUrl: string) {
    const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3 || !matches[2]) {
      console.error("Invalid data URL");
      return;
    }

    const filePath = `../screenshots/input/vehicles/${this.currentModel}.png`;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const buffer = Buffer.from(matches[2], "base64");
    fs.writeFileSync(filePath, buffer);

    console.log(`Finished ${this.currentModel}, progress ${this.processIndex}/${this.vehicleModelsToProcess.length}`);

    this.waitForResult?.resolve(true);
  }
}
