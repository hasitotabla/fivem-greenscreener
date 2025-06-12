import { waitFor, type ScreenshotEventHandler, type WeaponProcessData, type WeaponScreenshotInitData } from "@shared/index";

import config from "$/config.json";
import { BaseScreenshotFactory } from "./_Base";
import { emitServer, onServer } from "../../helpers/NetEvents";
import { Camera } from "../../helpers/Camera";
import { delay } from "../../helpers/Statements";
import { emitWebView } from "../../helpers/NUI";

const weaponOverrides: Record<
  number,
  {
    rotation?: [number, number, number];
    cameraOffset?: [number, number, number];
    cameraTargetOffset?: [number, number, number];
    cameraFov?: number;
  }
> = {
  [GetHashKey("WEAPON_PISTOL")]: {
    rotation: [-15, -20, 180],
    cameraOffset: [0, 0.3, 0],
  },
};

export class WeaponScreenshotFactory extends BaseScreenshotFactory {
  private objectHandle: number | null = null;

  constructor(data: WeaponScreenshotInitData) {
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

  override async process(data: WeaponProcessData<string>) {
    while (this.objectHandle) {
      if (!DoesEntityExist(this.objectHandle)) {
        this.objectHandle = null;
        break;
      }

      DeleteObject(this.objectHandle);
      await delay(100);
    }

    this.processModel(data);
  }

  private async processModel(data: WeaponProcessData<string>) {
    const { x, y, z } = config.weapon.position;

    const hash = GetHashKey(data.model);

    const didLoad = await this.requestModel(hash);
    if (!didLoad) {
      console.error(`Failed to load weapon model: ${data.model}`);
      emitServer("skip");
      return;
    }

    const override = weaponOverrides[hash];

    this.objectHandle = CreateWeaponObject(hash, 30, x, y, z, true, 1.0, 0);
    FreezeEntityPosition(this.objectHandle, true);
    SetEntityAsMissionEntity(this.objectHandle, true, true);
    SetModelAsNoLongerNeeded(hash);

    const rotation = override?.rotation || [0, 0, 180];
    SetEntityRotation(this.objectHandle, rotation[0], rotation[1], rotation[2], 2, true);

    const cameraOffset = override?.cameraOffset || [0, 0.75, 0];
    const cameraTargetOffset = override?.cameraTargetOffset || [0, 0, 0];

    Camera.pointAt(
      { x: x - cameraOffset[0], y: y - cameraOffset[1], z: z - cameraOffset[2] },
      { x: x - cameraTargetOffset[0], y: y - cameraTargetOffset[1], z: z - cameraTargetOffset[2] },
      { fov: override?.cameraFov || 60 }
    );

    while (!DoesEntityExist(this.objectHandle)) {
      await delay(100);
    }

    await delay(100);

    emitWebView("requestScreenshot");
  }

  private async requestModel(weaponHash: number) {
    RequestWeaponAsset(weaponHash, 1, 0);
    waitFor(() => HasWeaponAssetLoaded(weaponHash), 10000);

    return HasWeaponAssetLoaded(weaponHash);
  }
}
