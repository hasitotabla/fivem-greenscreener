export type ScreenshotRequest = {
  id: number;

  encoding: "jpeg" | "png" | "webp";
  quality: number;

  onFinished(data: string): void;
};
