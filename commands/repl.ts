import repl from "repl";
import { generateChatCompletionStream } from "../util/ai.js";
import { parseGlobalChatConfig } from "../util/config.js";
// import { parseChatLogFromText } from "../util/parse.js";

export async function handleRepl(input: string, opts: { file: string }) {
  const globalChatConfig = await parseGlobalChatConfig();

  const messages: { role: "user" | "assistant" | "system"; content: string }[] =
    globalChatConfig.messages;
  const settings = globalChatConfig.settings;

  repl.start({
    prompt: "chatvim> ",
    eval: async (cmd, _ctx, _filename, cb) => {
      const callback = cb as (err: Error | null, result?: unknown) => void;

      const promptText = cmd.trim();
      if (!promptText) {
        return callback(null);
      }
      messages.push({ role: "user", content: promptText });
      try {
        const stream = await generateChatCompletionStream({
          messages,
          model: settings.model,
        });
        let reply = "";
        for await (const c of stream) {
          process.stdout.write(c);
          reply += c;
        }
        process.stdout.write("\n");
        messages.push({ role: "assistant", content: reply });
        callback(null);
      } catch (e) {
        if (e instanceof Error) {
          callback(e);
        } else {
          callback(
            new Error(
              "An unknown error occurred while processing the command.",
            ),
          );
        }
      }
    },
  });
}
