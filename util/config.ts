import { promises as fs } from "fs";
import { join } from "path";
import type { ChatRole, Settings } from "./parse.js";
import { parseChatLogFromText, SettingsSchema } from "./parse.js";

type Config = {
  messages: { role: ChatRole; content: string }[];
  settings: { [key: string]: unknown };
};

const defaultSettings: Settings = {
  delimiterPrefix: "\n\n",
  delimiterSuffix: "\n\n",
  userDelimiter: "# === USER ===",
  assistantDelimiter: "# === ASSISTANT ===",
  systemDelimiter: "# === SYSTEM ===",
  model: "grok-3",
};

/**
 * Loads and parses the global chat configuration from XDG_CONFIG_HOME/chatvim/config.md.
 * Returns the parsed configuration if the file exists and can be read/parsed;
 * otherwise, returns an empty configuration.
 */
export async function parseGlobalChatConfig(): Promise<{
  messages: { role: ChatRole; content: string }[];
  settings: Settings;
  globalConfigFile?: string;
}> {
  // Check if XDG_CONFIG_HOME environment variable is set
  const xdgConfigHome =
    process.env.XDG_CONFIG_HOME ||
    (process.env.HOME && join(process.env.HOME, ".config"));
  if (!xdgConfigHome) {
    console.warn(
      "XDG_CONFIG_HOME environment variable not set. No global configuration will be loaded.",
    );
    return { messages: [], settings: defaultSettings };
  }

  // Construct the path to chatvim/config.md
  const configDir = join(xdgConfigHome, "chatvim");
  const configFile = join(configDir, "config.md");

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
      return { messages: [], settings: defaultSettings };
    }
    console.error(
      `Error reading global configuration file at ${configFile}:`,
      // @ts-ignore
      err?.message,
    );
    return { messages: [], settings: defaultSettings };
  }

  // Parse the file contents
  let config: Config;
  try {
    config = parseChatLogFromText(fileContents, defaultSettings, []);
  } catch (err: unknown) {
    console.error(
      `Error parsing global configuration file at ${configFile}:`,
      // @ts-ignore
      err?.message,
    );
    return { messages: [], settings: defaultSettings };
  }

  // confirm settings against schema
  const parsedSettings = SettingsSchema.safeParse(config.settings);
  if (!parsedSettings.success) {
    console.error(
      `Invalid settings in global configuration file at ${configFile}:`,
      parsedSettings.error,
    );
    return { messages: [], settings: defaultSettings };
  }

  return {
    messages: config.messages || [],
    settings: parsedSettings.data,
    globalConfigFile: configFile,
  };
}
