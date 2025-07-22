# Chatvim CLI Changelog

## v0.3.6

- Repl is no longer the main command.
- The main command now opens Neovim in a Chatvim context with the command
  `nvim -c ':ChatvimNew'`. Of course, you must have Neovim installed with the
  Chatvim plugin installed for this to work.

## v0.3.5

- Add support for `grok-4-0709`

## v0.3.4

- Increase timeout to 120 seconds
- Custom spinner. Remove Ora dependency.
- Repl has color and formatting.

## v0.3.3

- Add `chatvim repl` and make it the default command.

## v0.3.2

- Remove `--model` option on the command line. Use global config instead.
- Add global config at `${XDG_CONFIG_HOME}/chatvim/config.json`
