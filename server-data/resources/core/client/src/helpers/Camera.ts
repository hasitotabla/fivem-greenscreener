export interface CameraOptions {
  fov?: number;
  interp?: {
    duration?: number;
  };
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export class Camera {
  private static DEFAULT_CAMERA_OPTIONS: CameraOptions = {
    fov: 90,
  };

  private static pool: Record<string, number> = {};
  private static cleanupInterp: (() => void) | null = null;

  private static createCamera(options: CameraOptions | undefined, mainFn: (handle: number) => void): number {
    const cameraOptions = options || this.DEFAULT_CAMERA_OPTIONS;

    if (this.cleanupInterp) {
      this.cleanupInterp();
      this.cleanupInterp = null;
    }

    if (this.pool["main"]) {
      this.pool["_old_main"] = this.pool["main"];
    }

    const handle = CreateCam("DEFAULT_SCRIPTED_CAMERA", true);
    this.pool["main"] = handle;

    mainFn(handle);

    if (cameraOptions.fov) {
      SetCamFov(handle, cameraOptions.fov);
    }

    if (!cameraOptions.interp) {
      SetCamActive(handle, true);

      if (this.pool["_old_main"]) {
        this.destroy("_old_main");
      }
    } else {
      const duration = cameraOptions.interp.duration || 1000;

      if (this.pool["_old_main"]) {
        SetCamActiveWithInterp(handle, this.pool["_old_main"], duration, 1, 1);
      }

      this.cleanupInterp = () => {
        if (this.pool["_old_main"]) {
          this.destroy("_old_main");
        }
      };
    }

    RenderScriptCams(true, false, 0, true, true);

    return handle;
  }

  /**
   * Creates a new camera object
   * @param position Camera position
   * @param rotation Camera rotation
   * @param options Camera options
   * @returns Camera handle
   */
  public static create(position: Vector3, rotation: Vector3, options?: CameraOptions): number {
    if (typeof position !== "object" || position === null || typeof position.x !== "number") {
      throw new Error(`Arg #1 @ Core.Camera.create | Expected Vector3, got ${typeof position}`);
    }
    if (typeof rotation !== "object" || rotation === null || typeof rotation.x !== "number") {
      throw new Error(`Arg #2 @ Core.Camera.create | Expected Vector3, got ${typeof rotation}`);
    }

    const cameraOptions = options || this.DEFAULT_CAMERA_OPTIONS;

    return this.createCamera(cameraOptions, (handle) => {
      SetCamCoord(handle, position.x, position.y, position.z);
      SetCamRot(handle, rotation.x, rotation.y, rotation.z, 1);
    });
  }

  /**
   * Points the camera at a specific position
   * @param position Camera position
   * @param pointAt Position to point at
   * @param options Camera options
   * @returns Camera handle
   */
  public static pointAt(position: Vector3, pointAt: Vector3, options?: CameraOptions): number {
    if (typeof position !== "object" || position === null || typeof position.x !== "number") {
      throw new Error(`Arg #1 @ Core.Camera.pointAt | Expected Vector3, got ${typeof position}`);
    }
    if (typeof pointAt !== "object" || pointAt === null || typeof pointAt.x !== "number") {
      throw new Error(`Arg #2 @ Core.Camera.pointAt | Expected Vector3, got ${typeof pointAt}`);
    }

    const cameraOptions = options || this.DEFAULT_CAMERA_OPTIONS;

    return this.createCamera(cameraOptions, (handle) => {
      SetCamCoord(handle, position.x, position.y, position.z);
      PointCamAtCoord(handle, pointAt.x, pointAt.y, pointAt.z);
    });
  }

  /**
   * Points the camera at a specific bone
   * @param position Camera position
   * @param ped Ped handle
   * @param bone Bone index
   * @param options Camera options
   * @returns Camera handle
   */
  public static pointAtBone(position: Vector3, ped: number, bone: number, options?: CameraOptions): number {
    if (typeof position !== "object" || position === null || typeof position.x !== "number") {
      throw new Error(`Arg #1 @ Core.Camera.pointAtBone | Expected Vector3, got ${typeof position}`);
    }
    if (typeof ped !== "number") {
      throw new Error(`Arg #2 @ Core.Camera.pointAtBone | Expected number, got ${typeof ped}`);
    }
    if (typeof bone !== "number") {
      throw new Error(`Arg #3 @ Core.Camera.pointAtBone | Expected number, got ${typeof bone}`);
    }

    const cameraOptions = options || this.DEFAULT_CAMERA_OPTIONS;

    return this.createCamera(cameraOptions, (handle) => {
      SetCamCoord(handle, position.x, position.y, position.z);
      PointCamAtPedBone(handle, ped, bone, 0, 0, 0, true);
    });
  }

  /**
   * Points the camera at a specific entity
   * @param position Camera position
   * @param entity Entity handle
   * @param options Camera options
   * @returns Camera handle
   */
  public static pointAtEntity(position: Vector3, entity: number, options?: CameraOptions): number {
    if (typeof position !== "object" || position === null || typeof position.x !== "number") {
      throw new Error(`Arg #1 @ Core.Camera.pointAtEntity | Expected Vector3, got ${typeof position}`);
    }
    if (typeof entity !== "number") {
      throw new Error(`Arg #2 @ Core.Camera.pointAtEntity | Expected number, got ${typeof entity}`);
    }

    const cameraOptions = options || this.DEFAULT_CAMERA_OPTIONS;

    return this.createCamera(cameraOptions, (handle) => {
      SetCamCoord(handle, position.x, position.y, position.z);
      PointCamAtEntity(handle, entity, 0, 0, 0, true);
    });
  }

  /**
   * Destroys a camera by name
   * @param name Camera name in the pool
   */
  public static destroy(name: string): void {
    if (this.pool[name]) {
      DestroyCam(this.pool[name], false);
      delete this.pool[name];
    }

    RenderScriptCams(false, false, 0, true, true);
  }

  /**
   * Destroys all cameras
   */
  public static destroyAll(): void {
    for (const name in this.pool) {
      this.destroy(name);
    }
  }

  /**
   * Sets camera position
   * @param handle Camera handle
   * @param position New position
   */
  public static setPosition(handle: number, position: Vector3): void {
    if (typeof handle !== "number") {
      throw new Error(`Arg #1 @ Core.Camera.setPosition | Expected number, got ${typeof handle}`);
    }
    if (typeof position !== "object" || position === null || typeof position.x !== "number") {
      throw new Error(`Arg #2 @ Core.Camera.setPosition | Expected Vector3, got ${typeof position}`);
    }

    SetCamCoord(handle, position.x, position.y, position.z);
  }

  /**
   * Sets camera rotation
   * @param handle Camera handle
   * @param rotation New rotation
   */
  public static setRotation(handle: number, rotation: Vector3): void {
    if (typeof handle !== "number") {
      throw new Error(`Arg #1 @ Core.Camera.setRotation | Expected number, got ${typeof handle}`);
    }
    if (typeof rotation !== "object" || rotation === null || typeof rotation.x !== "number") {
      throw new Error(`Arg #2 @ Core.Camera.setRotation | Expected Vector3, got ${typeof rotation}`);
    }

    SetCamRot(handle, rotation.x, rotation.y, rotation.z, 1);
  }
}
