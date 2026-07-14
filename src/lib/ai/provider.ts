/**
 * AI provider abstraction.
 *
 * Product code (audits, generators) NEVER imports the OpenAI SDK directly.
 * It depends on this `AIProvider` interface so we can swap or A/B different
 * models — GPT, Claude, Gemini, DeepSeek — without touching feature logic.
 *
 * The full pipeline is:
 *   Context Builder → Prompt Builder → AIProvider → Response Parser → Storage
 *
 * Concrete providers (e.g. the OpenAI implementation) are registered in
 * Milestone 5/6 when the audit engine is built. This file defines the contract.
 */

export type AIMessageRole = "system" | "user" | "assistant";

export interface AIMessage {
  role: AIMessageRole;
  content: string;
}

export interface AICompletionRequest {
  /** Fully-built messages produced by the Prompt Builder. */
  messages: AIMessage[];
  /** Provider-agnostic model identifier (resolved per provider). */
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Ask the provider to return strict JSON when supported. */
  json?: boolean;
  /** Correlates the call with the audit/generation that triggered it. */
  traceId?: string;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AICompletionResponse {
  content: string;
  usage: AIUsage;
  model: string;
  provider: string;
}

export interface AIProvider {
  readonly id: string;
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
}

const registry = new Map<string, AIProvider>();
let defaultProviderId: string | null = null;

/** Register a provider implementation (called during app bootstrap). */
export function registerProvider(provider: AIProvider, asDefault = false) {
  registry.set(provider.id, provider);
  if (asDefault || defaultProviderId === null) {
    defaultProviderId = provider.id;
  }
}

/** Resolve a provider by id, or the configured default. */
export function getProvider(id?: string): AIProvider {
  const key = id ?? defaultProviderId;
  const provider = key ? registry.get(key) : undefined;
  if (!provider) {
    throw new Error(
      `AI provider "${key ?? "(none)"}" is not registered. Register one during bootstrap.`,
    );
  }
  return provider;
}
