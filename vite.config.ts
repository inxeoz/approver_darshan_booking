import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default ({ mode }) => {
  // Load env variables based on the current mode (development / production)
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    plugins: [tailwindcss(), sveltekit()],
    server: {
      proxy: {
        "/api": {
          // Use the value from your .env file
          target: env.VITE_TARGET,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        },
      },
    },
  });
};
