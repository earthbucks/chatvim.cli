import repl from "repl";
import { generateChatCompletionStream } from "../util/ai.js";
import { parseGlobalChatConfig } from "../util/config.js";
// import { parseChatLogFromText } from "../util/parse.js";

export async function handleRepl(input: string, opts: { file: string }) {
  const globalChatConfig = await parseGlobalChatConfig();

  const messages: { role: "user" | "assistant" | "system"; content: string }[] = globalChatConfig.messages;
  const settings = globalChatConfig.settings;

  repl.start({
    prompt: "chatvim> ",
    eval: async (cmd, _ctx, _filename, cb) => {
      const promptText = cmd.trim();
      if (!promptText) {
        return cb(null, undefined);
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
        messages.push({ role: "assistant", content: reply });
        cb(null, undefined);
      } catch (e) {
        if (e instanceof Error) {
          cb(e, undefined);
        } else {
          cb(
            new Error(
              "An unknown error occurred while processing the command.",
            ),
            undefined,
          );
        }
      }
    },
  });
}
