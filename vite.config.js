import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/insights": {
        target: "http://4.187.210.124.nip.io",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/insights/, "/insights"),
      },
    },
  },
});
