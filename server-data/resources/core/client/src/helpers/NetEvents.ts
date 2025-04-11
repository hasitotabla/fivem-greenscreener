import { type INetEventData, type INetEvents } from "@shared/types/NetEvents";

type Listener = (...args: any) => void;
export type Unsubscriber = () => void;

const listeners: Record<string, Listener[]> = {};

export const emitServer = <E extends keyof INetEvents>(action: E, data: INetEventData<E> = {}) => {
  TriggerServerEvent("onAction", {
    action,
    data,
  });
};

export const onServer = <E extends keyof INetEvents>(
  eventName: E,
  listener: (data: Parameters<INetEvents[E]>[0]) => void
): Unsubscriber => {
  if (!listeners[eventName]) {
    listeners[eventName] = [];

    onNet(eventName, (...args: any) => {
      listeners?.[eventName]?.forEach((func) => func(...args));
    });
  }

  listeners[eventName].push(listener);

  return () => {
    if (!listeners[eventName]) {
      return;
    }

    for (let i = 0; i < listeners[eventName].length; i++) {
      if (listeners[eventName][i] === listener) {
        listeners[eventName].splice(i, 1);
      }
    }
  };
};
