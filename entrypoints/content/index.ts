import { content } from "./content";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  main() {
    content();
  },
});
