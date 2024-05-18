import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";
import { Plugin } from "vite";

// web3js currently includes `process["env"].NODE_ENV
// we switch this at build time to the Vite mode (typically development or production)
function replaceProcessEnv(mode: string): Plugin {
  const nodeEnvRegex = /process(\.env(\.NODE_ENV)|\["env"\]\.NODE_ENV)/g;
  return {
    name: "replace-process-env",
    renderChunk(code) {
      return code.replace(nodeEnvRegex, JSON.stringify(mode));
    },
  };
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: ({ mode }) => {
    console.log("\nbuilding in mode", mode);
    return {
      plugins: [react(), replaceProcessEnv(mode)],
    };
  },
  manifest: {
    name: "Orbit",
    description: "Organise your Solana wallets",
    version: "1.1.0",
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
