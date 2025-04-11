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
});
