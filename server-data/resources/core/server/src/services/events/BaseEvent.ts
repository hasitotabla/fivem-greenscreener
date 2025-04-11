import type { EventList, Events, IEventProvider } from "../../types/Events";

export abstract class BaseEventProvider implements IEventProvider {
  private listeners: Map<EventList, Set<Function>> = new Map();

  destroy(): void {
    this.listeners.clear();
  }

  on<E extends EventList>(event: E, listener: (data: Events[E]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)?.add(listener);
  }

  off<E extends EventList>(event: E, listener: (data: Events[E]) => void): void {
    this.listeners.get(event)?.delete(listener);
  }

  once<E extends EventList>(event: E, listener: (data: Events[E]) => void): void {
    const handler = (data: Events[E]) => {
      listener(data);
      this.off(event, handler);
    };

    this.on(event, handler);
  }

  protected emit(event: EventList, data: any): void {
    for (const listener of this.listeners.get(event) || []) {
      listener(data);
    }
  }
}
