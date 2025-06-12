import fs from "fs";
import path from "path";

import type { CommandParseResult, IScreenshotService } from "../../interfaces/Screenshot";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

export abstract class BaseScreenshotService implements IScreenshotService {
  constructor(protected type: string) {}

  abstract process(): Promise<void>;
  abstract cleanup(): void;
  abstract parseCommandData(data: string[]): CommandParseResult;

  // private async processAllImages() {}

  async postProcessImages(): Promise<void> {}

  public async saveImageUrlToFile(name: string, imageUrl: string) {
    const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3 || !matches[2]) {
      console.error("Invalid data URL");
      return;
    }

    const filePath = `../screenshots/input/${this.type}/${name}.png`;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const buffer = Buffer.from(matches[2], "base64");
    fs.writeFileSync(filePath, buffer);
  }
}
