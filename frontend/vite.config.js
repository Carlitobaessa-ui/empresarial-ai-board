import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Nome do repositorio no GitHub Pages (https://SEU-USUARIO.github.io/<repo>/).
// Precisa bater com o nome do repositorio criado no GitHub.
const REPO_NAME = "empresarial-ai-board";

export default defineConfig(({ command }) => ({
  // Em dev (vite) o base fica "/"; no build de producao (usado pelo GitHub
  // Pages) o site vive em um subcaminho com o nome do repositorio.
  base: command === "build" ? `/${REPO_NAME}/` : "/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
}));
