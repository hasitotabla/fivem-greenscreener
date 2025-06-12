import type { PedScreenshotService } from "../services/screenshot/Ped";
import type { VehicleScreenshotService } from "../services/screenshot/Vehicle";
import type { WeaponScreenshotService } from "../services/screenshot/Weapon";

export type ScreenshotServices = VehicleScreenshotService | PedScreenshotService | WeaponScreenshotService;
