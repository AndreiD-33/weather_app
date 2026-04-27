/**
 * vite.config.js — Configurare Vite + React + Tailwind CSS v4
 * Proxy: cererile /api sunt redirecționate catre Express (:5000)
 * elimina erorile CORS in dezvoltare
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 — detecteaza automat fisierele
  ],
  server: {
    port: 5173,
    proxy: {
      // Toate cererile /api merg la Express (:5000)
      "/api": "http://localhost:5000",
    },
  },
});