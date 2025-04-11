export type VehicleScreenshotInitData = {};

export type VehicleProcessData<ModelType = string[] | "all"> = {
  model: ModelType;
  colors: { primary: number; secondary: number };
};
