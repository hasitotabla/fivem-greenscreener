import { BaseEventProvider } from "./BaseEvent";

export class GameEventProvider extends BaseEventProvider {
  constructor() {
    super();

    onNet("onAction", this.onNetEvent.bind(this));
  }

  override destroy(): void {
    super.destroy();
  }

  private onNetEvent(requestData: any) {
    const player = global.source;

    if (typeof player !== "number") {
      console.error("Invalid player source");
      return;
    }

    if (typeof requestData !== "object") {
      console.error("Invalid data");
      return;
    }

    const { action, data } = requestData;
    if (!action) {
      console.error("Invalid action");
      return;
    }

    this.emit(action, data);
  }
}
