import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../"), "");

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_PORT) || 8080,
      host: true,
      fs: {
        strict: false,
      },
    },
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html')
      }
    }
  };
});
