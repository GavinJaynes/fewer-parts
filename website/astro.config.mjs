import { defineConfig } from "astro/config";
import wgslVitePlugin from "@vgpu/wgsl/loader-vite";

export default defineConfig({
  output: "static",
  devToolbar: { enabled: false },
  vite: {
    plugins: [wgslVitePlugin({ minify: true })],
  },
});
