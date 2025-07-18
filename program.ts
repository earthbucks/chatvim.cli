import { Command } from "commander";
import { commandBuffer } from "./commands/buffer.js";
import { commandLog } from "./commands/chat.js";
import { commandColor } from "./commands/color.js";
import { commandComplete } from "./commands/complete.js";
import { commandFormat } from "./commands/format.js";
import { commandMain } from "./commands/main.js";
import { commandModels } from "./commands/models.js";
import { commandProviders } from "./commands/providers.js";
import { commandRepl } from "./commands/repl.js";

const program = new Command();

program
  .name("chatvim")
  .description("Chatvim: LLM-powered coding assistant")
  .version("0.3.5")
  .action(commandMain);

program
  .command("complete")
  .argument(
    "[input]",
    "Prompt text to send to the LLM (optional; can be piped)",
  )
  .description("Send a prompt to the LLM (argument or stdin)")
  .option("--chunk", "Put each chunk in a JSON object on a new line", false)
  .option("--add-delimiters", "Add delimiters to the response", false)
  .action(commandComplete);

program
  .command("log")
  .description("Chat with a markdown file to maintain context")
  .argument(
    "[input]",
    "Prompt text to send to the LLM (optional; can be piped)",
  )
  .option(
    "--file <file>",
    "Markdown file to use as context (optional)",
    "chat.md",
  )
  .action(commandLog);

program
  .command("repl")
  .description("Start a REPL for interactive chat with the LLM")
  .action(commandRepl);

program
  .command("models")
  .description("List available models")
  .action(commandModels);

program
  .command("providers")
  .description("List available providers")
  .action(commandProviders);

program
  .command("buffer")
  .argument("[input]", "Input text to buffer (optional; can be piped)")
  .description(
    "Buffer input and show a spinner while waiting (argument or stdin)",
  )
  .action(commandBuffer);

program
  .command("format")
  .argument("[input]", "Markdown input to format (optional; can be piped)")
  .description(
    "Format Markdown input with proper line wrapping (argument or stdin)",
  )
  .action(commandFormat);

program
  .command("color")
  .argument("[input]", "Markdown input to colorize (optional; can be piped)")
  .description(
    "Apply syntax highlighting to Markdown input (argument or stdin)",
  )
  .action(commandColor);

export { program };
