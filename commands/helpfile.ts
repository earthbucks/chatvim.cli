// get dirname with typescript/node.js
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const helpFilePath = path.join(__dirname, "..", "..", "docs", "help.md");

export async function commandHelpfile() {
  // Read the help file content
  try {
    const helpContent = await fs.promises.readFile(helpFilePath, "utf-8");
    // Print the content to the console
    process.stdout.write(helpContent);
  } catch (error) {
    console.error("Error reading help file:", error);
  }
}
