import type { EventList, Events, EventSource } from "../types/Events";
import type { GameEventProvider } from "./events/GameEvents";
import type { WebEventProvider } from "./events/WebEvents";

export class EventsService {
  constructor(private providers: { game?: GameEventProvider; web?: WebEventProvider }) {}

  destroy(): void {
    this.providers.game?.destroy();
    this.providers.web?.destroy();
  }

  on<E extends EventList>(event: E, listener: (data: Events[E], source: EventSource) => void): void {
    this.providers.game?.on(event, (data) => listener(data, "game"));
    this.providers.web?.on(event, (data) => listener(data, "web"));
  }

  off<E extends EventList>(event: E, listener: (data: Events[E], source: EventSource) => void): void {
    this.providers.game?.off(event, (data) => listener(data, "game"));
    this.providers.web?.off(event, (data) => listener(data, "web"));
  }

  once<E extends EventList>(event: E, listener: (data: Events[E], source: EventSource) => void): void {
    this.providers.game?.once(event, (data) => listener(data, "game"));
    this.providers.web?.once(event, (data) => listener(data, "web"));
  }
}
