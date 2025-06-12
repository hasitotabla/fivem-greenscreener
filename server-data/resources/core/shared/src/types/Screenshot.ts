import type {
  VehicleScreenshotInitData,
  // ClothScreenshotInitData,
  // ObjectScreenshotInitData,
  ClothScreenshotProcessData,
  ObjectScreenshotProcessData,
  VehicleProcessData,
  PedScreenshotInitData,
  WeaponScreenshotInitData,
} from "./_index";

export type ScreenshotInitData =
  | { type: "vehicle"; data: VehicleScreenshotInitData }
  | { type: "ped"; data: PedScreenshotInitData }
  // | { type: "object"; data: ObjectScreenshotInitData }
  | { type: "weapon"; data: WeaponScreenshotInitData };
// | { type: "cloth"; data: ClothScreenshotInitData }

export type ScreenshotProcessData = ClothScreenshotProcessData | ObjectScreenshotProcessData | VehicleProcessData;

export type ScreenshotEventHandler<T> = (data: T) => any;
export type ScreenshotFactoryKeys = ScreenshotInitData["type"];
export type ScreenshotFactory = ScreenshotInitData["data"];
