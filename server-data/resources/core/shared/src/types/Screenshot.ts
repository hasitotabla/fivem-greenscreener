import type {
  VehicleScreenshotInitData,
  ClothScreenshotInitData,
  ObjectScreenshotInitData,
  ClothScreenshotProcessData,
  ObjectScreenshotProcessData,
  VehicleProcessData,
} from "./_index";

export type ScreenshotInitData =
  | { type: "vehicle"; data: VehicleScreenshotInitData }
  | { type: "object"; data: ObjectScreenshotInitData }
  | { type: "cloth"; data: ClothScreenshotInitData };

export type ScreenshotProcessData = ClothScreenshotProcessData | ObjectScreenshotProcessData | VehicleProcessData;

export type ScreenshotEventHandler<T> = (data: T) => any;
export type ScreenshotFactories = ScreenshotInitData["type"];
