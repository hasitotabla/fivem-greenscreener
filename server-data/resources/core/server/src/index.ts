import "@citizenfx/server";

import path from "path";

import { wait } from "@shared/index";

import config from "../../config.json";
import { VehicleScreenshotService } from "./services/screenshot/Vehicle";

const factories = {
  vehicle: VehicleScreenshotService,
};

class Application {
  private currentFactory: VehicleScreenshotService | null = null;

  constructor() {
    RegisterCommand(config.command, this.handleCommand.bind(this), false);
  }

  private handleCommand(source: number, args: string[]): void {
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
      console.log(`Could find factory for ${factoryName}!`);
      return;
    }

    this.currentFactory = new factoryService();

    const result = this.currentFactory.parseCommandData(rest);
    if (!result.success) {
      console.log(`Error parsing command data! Index: ${result.error.index}, Message: ${result.error.message}`);
      return;
    }

    this.currentFactory.process();
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
