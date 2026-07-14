import "server-only";
import { getProvider, registerProvider, type AIProvider } from "./provider";
import { OpenAIProvider } from "./openai-provider";

let bootstrapped = false;

/** Register the default AI provider once, then return it. */
export function ensureAIProvider(): AIProvider {
  if (!bootstrapped) {
    registerProvider(new OpenAIProvider(), true);
    bootstrapped = true;
  }
  return getProvider();
}
