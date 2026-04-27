/**
 * main.jsx — Punctul de intrare al aplicatiei React
 * Autor: Echipa Proiect 11
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"; // Tailwind CSS trebuie importat aici
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);