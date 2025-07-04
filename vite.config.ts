import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import viteCompression from "vite-plugin-compression";

export default defineConfig(() => {
    return {
        plugins: [
            react(),
        ],
        resolve: {
            alias: {
                // "~": path.resolve(__dirname, "src"),
            },
        },
    };
});
