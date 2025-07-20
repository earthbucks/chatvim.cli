# Chatvim CLI

**Chat with markdown files on the command line.**

Chatvim CLI is the back-end for
[chatvim.nvim](https://https://github.com/chatvim/chatvim.nvim), a Neovim plugin
that lets you chat with markdown files in Neovim.

## Basic Idea

The basic idea of Chatvim CLI is to put LLMs on the command line, like this:

```sh
chatvim complete "What is 1 + 1?"
```

Output

```sh
1 + 1 is 2.
```

Read on for more details.

## Installation

Install globally using npm:

```sh
npm install -g chatvim
```

This provides one global command:

- `chatvim` &nbsp;—&nbsp; Main entry point for Chatvim CLI

## Usage

### API Keys

You MUST first set at least one API key for an LLM provider.

```sh
export OPENAI_API_KEY=your_openai_api_key
export ANTHROPIC_API_KEY=your_anthropic_api_key
export XAI_API_KEY=your_xai_api_key
```

### Help

For full usage instructions, run:

```sh
chatvim --help
```

### Command List

A brief overview of available commands:

- **complete** &nbsp;—&nbsp; Send a prompt to the LLM and get a response
- **log** &nbsp;—&nbsp; Save a prompt and response to a markdown file
- **buffer** &nbsp;—&nbsp; Buffer input for later processing
- **format** &nbsp;—&nbsp; Format markdown output for better readability
- **color** &nbsp;—&nbsp; Colorize markdown output for better visibility
- **models** &nbsp;—&nbsp; List available LLM models
- **providers** &nbsp;—&nbsp; List available LLM providers

## Example Workflows

```sh
# Simple math prompt
chatvim complete "What is 2 plus 2?"

# Code generation
chatvim complete "Generate a JavaScript function that reverses an array"

# Use a markdown file as context and log the response
chatvim log --file chat.md "Generate a Python function to calculate factorial"

# If you don't specify the file name, it will default to `chat.md`
chatvim log "Generate a Python function to calculate Fibonacci sequence"
# ^ This will create or overwrite `chat.md`

# Pipe input as prompt
cat my-instructions.txt | chatvim complete

# Generate, buffer, format, and colorize Markdown output
chatvim complete "Show me a Python bubble sort function with comments in Markdown." | chatvim buffer | chatvim format | chatvim color

# Buffer and format direct Markdown input
echo "# Quick Note\n\nThis is a short note with a code block:\n\n\`\`\`bash\necho 'Hello, World!'\n\`\`\`" | chatvim buffer | chatvim format

# Format and colorize without buffering
chatvim complete "Write a short Markdown note." | chatvim format | chatvim color
```

## Configuration

You can set global configuration for Chatvim CLI by creating a file at
`${XDG_CONFIG_HOME}/chatvim/config.md`) (usually `~/.config/chatvim/config.md`).

Yes, that's right, Chatvim CLI uses a markdown file for configuration.

You can set YAML/TOML configuration at the top, and then you can also specify a
chat lot to be used in all chats (defaults to empty).

### Example Configuration #1

Example `config.md`:

```markdown
+++
model = "o3"
+++
```

This example configuration file sets the default model to OpenAI's `o3` using
TOML configuration.

### Example Configuration #2

Global chat history example with TOML configuration:

```markdown
+++
model = "grok-3"
userDelimiter = "# === USER ==="
assistantDelimiter = "# === ASSISTANT ==="
+++

Your name is Codey Beaver, a helpful coding assistant. You are a beaver who just
loves nothing more than to help the user code their app!

# === ASSISTANT ===

Hello, my name is Codey Beaver! I'm here to help you with your coding tasks. How
can I assist you today?
```

### Example Configuration #3

YAML configuration example:

```markdown
---
model: "claude-sonnet-4-0"
userDelimiter: "**user**"
assistantDelimiter: "**assistant**"
---

Your name is Codey Beaver, a helpful coding assistant. You are a beaver who just
loves nothing more than to help the user code their app!

**assistant**

Hello, my name is Codey Beaver! I'm here to help you with your coding tasks. How
can I assist you today?
```

## License

Copyright (C) 2025 EarthBucks Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

    http://www.apache.org/licenses/LICENSE-2.0
