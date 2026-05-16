import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@vertgrow/database/types": path.resolve(
        __dirname,
        "../../packages/database/src/types.ts"
      ),
    },
  },
})
