import deepmerge from "deepmerge";
import { promises as fs } from "fs";
import { join } from "path";
import { parseChatLogFromText } from "./parse.js";

export type ChatRole = "user" | "assistant" | "system";

type Config = {
  messages: { role: ChatRole; content: string }[];
  settings: { [key: string]: unknown };
};

/**
 * Loads and parses the global chat configuration from XDG_CONFIG_HOME/chatvim/chat.md.
 * Returns the parsed configuration if the file exists and can be read/parsed;
 * otherwise, returns an empty configuration.
 */
export async function parseGlobalChatConfig(): Promise<{
  messages: { role: ChatRole; content: string }[];
  settings: { [key: string]: unknown };
  hasGlobalConfig: boolean;
}> {
  // Check if XDG_CONFIG_HOME environment variable is set
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (!xdgConfigHome) {
    console.warn(
      "XDG_CONFIG_HOME environment variable not set. No global configuration will be loaded.",
    );
    return { messages: [], settings: {}, hasGlobalConfig: false };
  }

  // Construct the path to chatvim/chat.md
  const configDir = join(xdgConfigHome, "chatvim");
  const configFile = join(configDir, "chat.md");

  try {
    // Attempt to read the file
    const fileContent = await fs.readFile(configFile, "utf-8");
    // Parse the content using the existing parseChatLogFromText function
    const parsedConfig = parseChatLogFromText(fileContent);
    console.log(`Loaded global configuration from ${configFile}`);
    return { ...parsedConfig, hasGlobalConfig: true };
  } catch (err: unknown) {
    // Handle different error scenarios
    // @ts-ignore
    if (err?.code === "ENOENT") {
      console.warn(
        `Global configuration file not found at ${configFile}. Using empty configuration.`,
      );
    } else {
      console.warn(
        `Failed to read global configuration from ${configFile}:`,
        // @ts-ignore
        err?.message,
      );
    }
    return { messages: [], settings: {}, hasGlobalConfig: false };
  }
}
