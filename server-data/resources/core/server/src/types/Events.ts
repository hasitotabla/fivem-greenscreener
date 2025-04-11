import type { GameEventProvider } from "../services/events/GameEvents";
import type { WebEventProvider } from "../services/events/WebEvents";

export interface Events {
  processComplete: { imageData: string };
  skip: {};
}

export interface IEventProvider {
  on<E extends EventList>(event: E, listener: (data: Events[E]) => void): void;
  off<E extends EventList>(event: E, listener: (data: Events[E]) => void): void;
  once<E extends EventList>(event: E, listener: (data: Events[E]) => void): void;
}

export type EventList = keyof Events;
export type EventSource = "game" | "web";

export type EventProviders = WebEventProvider | GameEventProvider;
