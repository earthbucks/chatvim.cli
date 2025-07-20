// get dirname with typescript/node.js
import fs from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const helpFilePath = path.join(__dirname, "..", "..", "docs", "help.md");

export async function commandHelpfile() {
  // Read the help file content
  try {
    const helpContent = await fs.promises.readFile(helpFilePath, "utf-8");
    // Print the content to the console
    console.log(helpContent);
  } catch (error) {
    console.error("Error reading help file:", error);
  }
}
