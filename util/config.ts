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
  globalConfigFile?: string;
}> {
  // Check if XDG_CONFIG_HOME environment variable is set
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (!xdgConfigHome) {
    console.warn(
      "XDG_CONFIG_HOME environment variable not set. No global configuration will be loaded.",
    );
    return { messages: [], settings: {} };
  }

  // Construct the path to chatvim/chat.md
  const configDir = join(xdgConfigHome, "chatvim");
  const configFile = join(configDir, "chat.md");

  // if the directory doesn't exist, create it
  try {
    await fs.mkdir(configDir, { recursive: true });
  } catch (err: unknown) {
    console.warn(
      `Failed to create global configuration dir at ${configDir}:`,
      // @ts-ignore
      err?.message,
    );
  }

  // Get the file contents if it exists
  let fileContents: string;
  try {
    fileContents = await fs.readFile(configFile, "utf-8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(
        `Global configuration file not found at ${configFile}. No global configuration will be loaded.`,
      );
      return { messages: [], settings: {} };
    }
    console.error(
      `Error reading global configuration file at ${configFile}:`,
      // @ts-ignore
      err?.message,
    );
    return { messages: [], settings: {} };
  }

  // Parse the file contents
  let config: Config;
  try {
    config = parseChatLogFromText(fileContents);
  } catch (err: unknown) {
    console.error(
      `Error parsing global configuration file at ${configFile}:`,
      // @ts-ignore
      err?.message,
    );
    return { messages: [], settings: {} };
  }

  // Merge with default settings
  const defaultSettings = {
    delimiterPrefix: "\n\n",
    delimiterSuffix: "\n\n",
    userDelimiter: "# === USER ===",
    assistantDelimiter: "# === ASSISTANT ===",
    systemDelimiter: "# === SYSTEM ===",
    model: "grok-3",
  };

  const settings = deepmerge(defaultSettings, config.settings || {});
  return {
    messages: config.messages || [],
    settings,
    globalConfigFile: configFile,
  };
}
