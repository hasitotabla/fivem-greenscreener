import "@citizenfx/server";

import { wait, type ScreenshotFactory, type ScreenshotFactoryKeys } from "@shared/index";

import config from "../../config.json";

import { VehicleScreenshotService } from "./services/screenshot/Vehicle";
import { PedScreenshotService } from "./services/screenshot/Ped";
import { WeaponScreenshotService } from "./services/screenshot/Weapon";
import type { ScreenshotServices } from "./types/Services";

const factories: Record<ScreenshotFactoryKeys, new () => ScreenshotServices> = {
  vehicle: VehicleScreenshotService,
  ped: PedScreenshotService,
  weapon: WeaponScreenshotService,
};

class Application {
  private currentFactory: ScreenshotServices | null = null;

  constructor() {
    RegisterCommand(config.command, this.handleCommand.bind(this), false);
  }

  private async handleCommand(source: number, args: string[]) {
    if (this.currentFactory) {
      if (this.currentFactory?.isProcessing) {
        console.log("Factory already in use! Please wait for the current process to finish.");
        return;
      }

      this.currentFactory.cleanup();
    }

    const [factoryName, ...rest] = args;

    if (!factoryName) {
      console.log(`Invalid factory name: ${factoryName}`);
      return;
    }

    const factoryService = factories[factoryName as keyof typeof factories];
    if (!factoryService) {
      console.log(`Couldn't find factory for ${factoryName}!`);
      return;
    }

    this.currentFactory = new factoryService();
    if (!this.currentFactory) {
      console.log(`Failed to create factory for ${factoryName}!`);
      return;
    }

    const result = this.currentFactory.parseCommandData(rest);
    if (!result.success) {
      console.log(`Error parsing command data! Index: ${result.error.index}, Message: ${result.error.message}`);
      return;
    }

    await this.currentFactory.process();
  }
}

new Application();

on("playerConnecting", async (name: string, kick: (reason: string) => void, deferrals: any) => {
  deferrals.defer();
  await wait(0);

  if (GetNumPlayerIndices() > 0) {
    deferrals.done("Only one player can be connected at a time.");
    return;
  }

  deferrals.done();
});
