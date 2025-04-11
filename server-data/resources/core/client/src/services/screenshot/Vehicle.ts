import type { ScreenshotEventHandler, VehicleScreenshotInitData } from "@shared/index";
import { type VehicleProcessData } from "@shared/index";

import config from "$/config.json";
import { BaseScreenshotFactory } from "./_Base";
import { emitServer, onServer } from "../../helpers/NetEvents";
import { Camera } from "../../helpers/Camera";
import { delay } from "../../helpers/Statements";
import { emitWebView } from "../../helpers/NUI";
import { requestModel } from "../../helpers/Model";

export class VehicleScreenshotFactory extends BaseScreenshotFactory {
  private vehicleHandle: number;

  constructor(data: VehicleScreenshotInitData) {
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

  override async process(data: VehicleProcessData<string>) {
    if (this.vehicleHandle) {
      this.destroyPreviousPreview();
    }

    this.createPreviewVehicle(data);
  }

  private async createPreviewVehicle(data: VehicleProcessData<string>) {
    const { x, y, z, heading } = config.vehicle.position;

    await requestModel(data.model);

    this.vehicleHandle = CreateVehicle(data.model, x, y, z, heading, false, true);
    SetVehicleColours(this.vehicleHandle, data.colors.primary, data.colors.secondary);

    let creatingSince = Date.now();
    while (!DoesEntityExist(this.vehicleHandle)) {
      if (creatingSince + 5000 < Date.now()) {
        emitServer("skip");

        return;
      }

      await delay(50);
    }

    FreezeEntityPosition(this.vehicleHandle, true);
    SetVehicleOnGroundProperly(this.vehicleHandle);
    await delay(500);

    const [, maximum] = GetModelDimensions(data.model);

    const panOut = Math.max(...maximum);

    Camera.pointAtEntity({ x, y: y - (panOut + 1.5), z: config.player.position.z + 0.35 }, this.vehicleHandle);
    await delay(500);

    emitWebView("requestScreenshot");
    SetModelAsNoLongerNeeded(data.model);
    SetVehicleAsNoLongerNeeded(this.vehicleHandle);
  }

  private async destroyPreviousPreview() {
    DeleteVehicle(this.vehicleHandle);

    const vehicles = GetGamePool("CVehicle") as number[];
    for (const vehicle of vehicles) DeleteEntity(vehicle);

    await delay(100);
  }
}
