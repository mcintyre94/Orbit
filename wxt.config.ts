import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";
import { PluginOption } from "vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite({ mode }): { plugins: PluginOption[] } {
    console.log("\nbuilding in mode", mode);
    return {
      plugins: [react()],
    };
  },
  manifest: {
    name: "Orbit",
    description: "Organise your Solana wallets",
    version: "1.1.5",
    web_accessible_resources: [
      {
        matches: ["<all_urls>"],
        resources: ["/injected.js"],
      },
    ],
    sidebar_action: {
      default_title: "Orbit",
      default_panel: "/sidepanel.html",
    },
    permissions: ["sidePanel", "storage", "downloads"],
  },
});
