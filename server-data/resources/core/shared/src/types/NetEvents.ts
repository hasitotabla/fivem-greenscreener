import type { ScreenshotInitData, ScreenshotProcessData } from "./Screenshot";

export interface INetEvents {
  ["Screenshot::Setup"]: (data: ScreenshotInitData) => void;
  ["Screenshot::Process"]: (data: ScreenshotProcessData) => void;
  ["Screenshot::Finished"]: () => void;

  processComplete: (data: { imageData: string }) => void;
  skip: () => void;
}

export type EventSource = "game" | "web";
export type EventList = keyof INetEvents;

export type INetEventData<E extends keyof INetEvents> = Parameters<INetEvents[E]>[0];
