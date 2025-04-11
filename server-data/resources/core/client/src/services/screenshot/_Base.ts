import type { Unsubscriber } from "../../helpers/NetEvents";
import { emitWebView } from "../../helpers/NUI";
import type { IScreenshotService } from "../../interfaces/Screenshot";

export abstract class BaseScreenshotFactory implements IScreenshotService {
  protected serverListeners: Array<Unsubscriber> = [];

  cleanup(): void {
    throw new Error("Method not implemented.");
  }

  async process(data: any): Promise<void> {
    throw new Error("Method not implemented.");
  }

  protected createScreenshot() {
    emitWebView("Screenshot::Create");
  }
}
