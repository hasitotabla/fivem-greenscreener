import { defineConfig } from "tsup";
import packageJson from "./package.json";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: false,
  // target: "cjs",
  outExtension(ctx) {
    return {
      js: ".js",
    };
  },
  format: "cjs",
  bundle: true,
  minify: false,
  external: [...Object.keys(packageJson.dependencies), "path"],
  noExternal: Object.keys(packageJson.devDependencies),

  async onSuccess() {
    fetch("http://localhost:30120/hmr/restartResources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resources: ["core"] }),
    }).catch(console.error);
  },
});
