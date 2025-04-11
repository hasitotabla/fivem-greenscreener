import {
  OrthographicCamera,
  Scene,
  WebGLRenderTarget,
  LinearFilter,
  NearestFilter,
  RGBAFormat,
  UnsignedByteType,
  CfxTexture,
  ShaderMaterial,
  PlaneBufferGeometry,
  Mesh,
  WebGLRenderer,
} from "@citizenfx/three";

import type { ScreenshotRequest } from "./Types";
import { SCREENSHOT_FRAGMENT_SHADER, SCREENSHOT_VERTEX_SHADER } from "./Data";

function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeString });
  return blob;
}

export const ScreenshotManager = () => {
  let renderer: any;
  let rtTexture: any;
  let sceneRTT: any;
  let cameraRTT: any;
  let material: any;
  let request: ScreenshotRequest | null = null;

  const init = (container: HTMLDivElement) => {
    cameraRTT = new OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      -10000,
      10000
    );
    cameraRTT.position.z = 100;

    sceneRTT = new Scene();
    rtTexture = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: LinearFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
      type: UnsignedByteType,
    });

    const gameTexture: any = new CfxTexture();
    gameTexture.needsUpdate = true;

    material = new ShaderMaterial({
      uniforms: { tDiffuse: { value: gameTexture } },
      vertexShader: SCREENSHOT_VERTEX_SHADER,
      fragmentShader: SCREENSHOT_FRAGMENT_SHADER,
    });

    const plane = new PlaneBufferGeometry(window.innerWidth, window.innerHeight);
    const quad: any = new Mesh(plane, material);
    quad.position.z = -100;
    sceneRTT.add(quad);

    renderer = new WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;

    container.appendChild(renderer.domElement);
    // document.getElementById("app").appendChild(renderer.domElement);
    // document.getElementById("app").style.display = "none";

    requestAnimationFrame(animate);
  };

  const animate = () => {
    requestAnimationFrame(animate);

    renderer.clear();
    renderer.render(sceneRTT, cameraRTT, rtTexture, true);

    if (request) {
      const _request = request;
      request = null;

      processRequest(_request);
    }
  };

  const processRequest = (req: ScreenshotRequest) => {
    const read = new Uint8Array(window.innerWidth * window.innerHeight * 4);
    renderer.readRenderTargetPixels(rtTexture, 0, 0, window.innerWidth, window.innerHeight, read);

    // create a temporary canvas to compress the image
    const canvas = document.createElement("canvas");
    canvas.style.display = "inline";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // draw the image on the canvas
    const d = new Uint8ClampedArray(read.buffer);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2d context");
    }

    ctx.putImageData(new ImageData(d, window.innerWidth, window.innerHeight), 0, 0);

    const imageUrl = canvas.toDataURL(req.encoding, req.quality ?? 0.92);
    // req.onFinished(dataURItoBlob(imageUrl).toString());
    req.onFinished(imageUrl);
  };

  return {
    init,
    onNewRequest(newRequest: ScreenshotRequest) {
      request = newRequest;
    },
  };
};
