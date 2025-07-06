import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import repl from "repl";
import { generateChatCompletionStream } from "../util/ai.js";
import { parseGlobalChatConfig } from "../util/config.js";

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
        let spinnerInterval: NodeJS.Timeout | undefined;
        if (BUFFER_OUTPUT) {
          const spinnerFrames = [
            "⠋",
            "⠙",
            "⠹",
            "⠸",
            "⠼",
            "⠴",
            "⠦",
            "⠧",
            "⠇",
            "⠏",
          ];
          let frameIndex = 0;
          process.stdout.write(`${spinnerFrames[0]} Buffering...`);
          spinnerInterval = setInterval(() => {
            frameIndex = (frameIndex + 1) % spinnerFrames.length;
            // Move cursor back and clear line before writing new frame
            process.stdout.write(
              `\r\x1b[K${spinnerFrames[frameIndex]} Buffering...`,
            );
          }, 100); // Update every 100ms
        }
        const stream = await generateChatCompletionStream({
          messages,
          model: settings.model,
        });
        let reply = "";
        for await (const c of stream) {
          if (!BUFFER_OUTPUT) {
            process.stdout.write(c);
          }
          reply += c;
        }
        if (BUFFER_OUTPUT && spinnerInterval) {
          clearInterval(spinnerInterval); // Stop the spinner
          process.stdout.write("\r\x1b[K"); // Clear the spinner line
        }
        process.stdout.write(`${assistantCliPrompt}`);
        if (reply.indexOf("\n") !== -1) {
          process.stdout.write("\n");
        }
        if (!COLOR_OUTPUT) {
          process.stdout.write(reply.trim());
        } else {
          // @ts-ignore – marked-terminal lacks full typings
          marked.setOptions({ renderer: new TerminalRenderer({ reflowText: true }) });
          const renderedOutput = await marked(reply);
          process.stdout.write(`${renderedOutput}`.trim());
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
