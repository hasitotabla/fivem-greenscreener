import type { ScreenshotEventHandler, PedScreenshotInitData, PedProcessData } from "@shared/index";

import config from "$/config.json";
import { BaseScreenshotFactory } from "./_Base";
import { emitServer, onServer } from "../../helpers/NetEvents";
import { Camera } from "../../helpers/Camera";
import { delay } from "../../helpers/Statements";
import { emitWebView } from "../../helpers/NUI";
import { requestModel } from "../../helpers/Model";

export class PedScreenshotFactory extends BaseScreenshotFactory {
  constructor(data: PedScreenshotInitData) {
    super();

    const { x, y, z } = config.player.position;
    FreezeEntityPosition(PlayerPedId(), true);
    SetEntityCoords(PlayerPedId(), x, y, z, true, false, false, false);

    this.serverListeners = [onServer("Screenshot::Process", this.process.bind(this) as ScreenshotEventHandler<any>)];
  }

  override cleanup(): void {
    this.serverListeners.forEach((e) => e());

    super.cleanup();
  }

  override async process(data: PedProcessData<string>) {
    this.processModel(data);
  }

  private async processModel(data: PedProcessData<string>) {
    const { x, y, z, heading } = config.ped.position;

    await requestModel(data.model);

    for (let i = 0; i < 10; i++) {
      if (HasModelLoaded(data.model)) {
        break;
      }

      await delay(100);
    }

    if (!HasModelLoaded(data.model)) {
      console.error(`Model ${data.model} failed to load after multiple attempts.`);
      emitServer("skip");
      return;
    }

    SetPlayerModel(PlayerId(), GetHashKey(data.model));
    SetEntityCoordsNoOffset(PlayerPedId(), x, y, z, false, false, false);
    SetEntityHeading(PlayerPedId(), heading);

    await delay(100);

    const boneIndex = GetPedBoneIndex(PlayerPedId(), 0x796e);
    const [boneX, boneY, boneZ] = GetPedBoneCoords(PlayerPedId(), boneIndex, 0, 0, 0);

    if (!boneX || !boneY || !boneZ) {
      console.error("Failed to get bone coordinates for the player.");
      emitServer("skip");
      return;
    }

    const [pedX, pedY, pedZ] = GetEntityCoords(PlayerPedId(), true);
    if (!pedX || !pedY || !pedZ) {
      console.error("Failed to get player coordinates.");
      emitServer("skip");
      return;
    }

    Camera.pointAt({ x: pedX, y: pedY - 1.6, z: pedZ + 0.4 }, { x: pedX, y: pedY, z: pedZ + 0.4 }, { fov: 60 });
    await delay(200);

    emitWebView("requestScreenshot");
    SetModelAsNoLongerNeeded(data.model);
  }
}
