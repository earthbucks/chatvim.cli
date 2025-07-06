import { models } from "../util/ai.js";

export async function commandModels() {
  for (const model of models) {
    console.log(`${model}`);
  }
}
