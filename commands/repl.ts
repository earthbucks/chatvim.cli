import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import repl from "repl";
import { generateChatCompletionStream } from "../util/ai.js";
import { parseGlobalChatConfig } from "../util/config.js";

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
        // start a spinner to indicate buffering
        let spinnerInterval: NodeJS.Timeout | undefined;
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

        // Generate the chat completion stream. for the repl, we assume the
        // user wants formatting and color, so we buffer the output instead of
        // streaming it directly. TODO: Support streaming formatted/colored
        // output in the future.
        const stream = await generateChatCompletionStream({
          messages,
          model: settings.model,
        });
        let reply = "";
        for await (const c of stream) {
          reply += c;
        }

        // Clear the spinner after completion
        if (spinnerInterval) {
          clearInterval(spinnerInterval); // Stop the spinner
          process.stdout.write("\r\x1b[K"); // Clear the spinner line
        }

        // Write the assistant's reply to stdout
        process.stdout.write(`${assistantCliPrompt}`);
        if (reply.indexOf("\n") !== -1) {
          process.stdout.write("\n");
        }
        marked.setOptions({
          // @ts-ignore – marked or marked-terminal lacks full typings
          renderer: new TerminalRenderer({ reflowText: true }),
        });
        const renderedOutput = await marked(reply);
        process.stdout.write(`${renderedOutput}`.trim());
        process.stdout.write("\n");

        // Append the assistant's reply to the messages
        messages.push({ role: "assistant", content: reply });

        // next prompt
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
