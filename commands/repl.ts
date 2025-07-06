import repl from "repl";
import { generateChatCompletionStream } from "../util/ai.js";
import { parseGlobalChatConfig } from "../util/config.js";
// import { parseChatLogFromText } from "../util/parse.js";
import ora, { Ora } from "ora";

const BUFFER_OUTPUT = true;
const COLOR_OUTPUT = true;

export async function handleRepl(input: string, opts: { file: string }) {
  const globalChatConfig = await parseGlobalChatConfig();

  const messages: { role: "user" | "assistant" | "system"; content: string }[] =
    globalChatConfig.messages;
  const settings = globalChatConfig.settings;

  const userCliPrompt = "\x1b[32muser>\x1b[0m ";
  const assistantCliPrompt = "\x1b[32massistant>\x1b[0m ";

  repl.start({
    prompt: userCliPrompt,
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
        process.stdout.write(`${assistantCliPrompt}`);
        let spinner: Ora | undefined;
        if (BUFFER_OUTPUT) {
          spinner = ora("Buffering output...").start();
        }
        for await (const c of stream) {
          if (!BUFFER_OUTPUT) {
            process.stdout.write(c);
          }
          reply += c;
        }
        if (BUFFER_OUTPUT) {
          if (spinner) {
            spinner.stop();
          }
          process.stdout.write(reply);
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
