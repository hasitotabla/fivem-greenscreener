import { defineConfig } from "tsup";
import packageJson from "./package.json";

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: "inline",
  clean: true,
  dts: false,
  format: "esm",
  bundle: true,
  external: Object.keys(packageJson.dependencies),
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
