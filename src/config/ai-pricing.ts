/**
 * Model pricing for cost monitoring, in USD per 1,000,000 tokens.
 *
 * Keep this table in sync with your provider's pricing (see SETUP.md). Unknown
 * models resolve to a cost of 0 so a missing entry never blocks generation —
 * add the model here to start tracking its spend.
 */
export interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10 },
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gpt-4.1": { inputPerMillion: 2, outputPerMillion: 8 },
  "gpt-4.1-mini": { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  // Placeholder for the configured default; update with real pricing.
  "gpt-5.5": { inputPerMillion: 5, outputPerMillion: 15 },
};

/** Cost of a generation in micro-USD (1e-6 USD), integer-precise. */
export function computeCostMicros(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return 0;
  const inputUsd = (promptTokens / 1_000_000) * pricing.inputPerMillion;
  const outputUsd = (completionTokens / 1_000_000) * pricing.outputPerMillion;
  return Math.round((inputUsd + outputUsd) * 1_000_000);
}
