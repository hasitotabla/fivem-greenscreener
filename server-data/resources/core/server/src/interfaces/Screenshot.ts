export type CommandParseResult = { success: true } | { success: false; error: { index: number; message: string } };

export interface IScreenshotService {
  process(): Promise<void>;
  cleanup(): void;
  parseCommandData(data: string[]): CommandParseResult;
}
