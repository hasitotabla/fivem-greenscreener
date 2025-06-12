import "@citizenfx/client";

import config from "$/config.json";
import { type ScreenshotFactoryKeys, type ScreenshotFactory, type INetEventData, waitFor } from "@shared/index";
// import type { INetEventData } from "@shared/types/NetEvents";

import { onServer } from "./helpers/NetEvents";
import { VehicleScreenshotFactory } from "./services/screenshot/Vehicle";
import { spawnPlayer } from "./helpers/Player";
import { PedScreenshotFactory } from "./services/screenshot/Ped";
import { WeaponScreenshotFactory } from "./services/screenshot/Weapon";

const ScreenshotFactories: Record<ScreenshotFactoryKeys, ScreenshotFactory> = {
  vehicle: VehicleScreenshotFactory,
  ped: PedScreenshotFactory,
  weapon: WeaponScreenshotFactory,

  // object: VehicleScreenshotFactory,
  // cloth: VehicleScreenshotFactory,
};

new (class {
  private currentFactory: VehicleScreenshotFactory | null = null;

  constructor() {
    spawnPlayer("a_m_y_skater_01", [0, 0, 72], 0);

    ShutdownLoadingScreen();

    NetworkOverrideClockMillisecondsPerGameMinute(1000000);
    setInterval(this.forceGameTimeAndWeather.bind(this), 1000);

    onServer("Screenshot::Setup", this.onSetup.bind(this));
    onServer("Screenshot::Finished", this.onFinished.bind(this));

    const hudComponents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22];
    setTick(() => {
      for (const component of hudComponents) HideHudComponentThisFrame(component);
    });
  }

  onSetup({ type, data }: INetEventData<"Screenshot::Setup">) {
    if (this.currentFactory) {
      return;
    }

    const factory = ScreenshotFactories[type];
    if (!factory) {
      console.error(`Unknown screenshot factory: ${type}`);
      return;
    }

    FreezeEntityPosition(PlayerId(), true);
    SetEntityCoordsNoOffset(PlayerPedId(), -11.6118, 668.6693, 343.0463, false, false, false);

    DisplayRadar(false);

    this.currentFactory = new (factory as any)(data as any);
  }

  onFinished() {
    if (this.currentFactory) {
      this.currentFactory.cleanup();
    }

    DisplayRadar(true);
  }

  forceGameTimeAndWeather() {
    SetWeatherTypeNowPersist(config.weather);

    const [hours, minutes, seconds] = config.time;
    if (hours !== undefined && minutes !== undefined && seconds !== undefined) {
      NetworkOverrideClockTime(hours, minutes, seconds);
    }
  }
})();

RegisterCommand(
  "crun",
  (_source: number, args: string[]) => {
    const code = args.join(" ");
    try {
      const result = eval(code);
      console.log("Command executed successfully:", result);
    } catch (e) {
      console.error(e);
    }
  },
  false
);

RegisterCommand(
  "setmodel",
  async (_source: number, args: string[]) => {
    const [model] = args;
    if (!model) {
      console.error("No model specified.");
      return;
    }

    const hash = parseInt(model) || GetHashKey(model);
    if (!IsModelValid(hash)) {
      console.error(`Invalid model: ${model}`);
      return;
    }

    RequestModel(hash);

    await waitFor(() => HasModelLoaded(hash), 10000);
    if (!HasModelLoaded(hash)) {
      console.error(`Model ${model} failed to load.`);
      return;
    }

    SetPlayerModel(PlayerId(), hash);
    SetModelAsNoLongerNeeded(hash);
  },
  false
);
