import { defineConfig } from "astro/config";
import wgslVitePlugin from "@vgpu/wgsl/loader-vite";

export default defineConfig({
  site: "https://fewerparts.dev",
  output: "static",
  devToolbar: { enabled: false },
  vite: {
    plugins: [wgslVitePlugin({ minify: true })],
  },
});
