import { spawnSync } from "child_process"; // Built-in Node.js module

export const commandMain = () => {
  try {
    // Spawn nvim interactively
    const child = spawnSync("nvim", ["-c", ":ChatvimNew"], {
      stdio: "inherit", // Inherit stdin/stdout/stderr for interactive use
      shell: false, // No shell needed for direct spawn
    });

    // Propagate Neovim's exit code
    process.exitCode = child.status ?? 0;
  } catch (error) {
    console.error(
      "Error: Could not start Neovim. Is it installed and in your PATH?",
    );
    // console.error(error.message);
    process.exit(1); // Exit with failure code
  }
};
