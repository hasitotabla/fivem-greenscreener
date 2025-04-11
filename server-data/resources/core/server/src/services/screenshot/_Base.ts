import fs from "fs";
import path from "path";

import type { CommandParseResult, IScreenshotService } from "../../interfaces/Screenshot";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

export abstract class BaseScreenshotService implements IScreenshotService {
  abstract process(): Promise<void>;
  abstract cleanup(): void;
  abstract parseCommandData(data: string[]): CommandParseResult;

  // private async processAllImages() {}

  async postProcessImages(): Promise<void> {}
}
