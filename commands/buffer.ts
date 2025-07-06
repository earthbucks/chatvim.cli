import { readStdin } from "../util/stdin.js";

export async function handleBuffer(input?: string) {
  let bufferText = input;
  const isPiped = !process.stdin.isTTY && !input;
  if (isPiped) {
    let spinnerInterval: NodeJS.Timeout | undefined;
    const spinnerFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let frameIndex = 0;
    process.stdout.write(`${spinnerFrames[0]} Buffering...`);
    spinnerInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % spinnerFrames.length;
      // Move cursor back and clear line before writing new frame
      process.stdout.write(`\r\x1b[K${spinnerFrames[frameIndex]} Buffering...`);
    }, 100); // Update every 100ms
    bufferText = await readStdin();
    if (spinnerInterval) {
      clearInterval(spinnerInterval); // Stop the spinner
      process.stdout.write("\r\x1b[K"); // Clear the spinner line
    }
  }
  if (!bufferText) {
    console.error(
      "No input supplied for buffering (argument or stdin required).",
    );
    process.exit(1);
  }
  process.stdout.write(`${bufferText}\n`);
}
