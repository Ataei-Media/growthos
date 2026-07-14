import "server-only";
import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";
import type {
  AICompletionRequest,
  AICompletionResponse,
  AIProvider,
} from "./provider";

/** Concrete OpenAI implementation of the provider contract. */
export class OpenAIProvider implements AIProvider {
  readonly id = "openai";
  private client: OpenAI;
  private defaultModel: string;

  constructor() {
    const env = getServerEnv();
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    this.defaultModel = env.OPENAI_MODEL;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model ?? this.defaultModel;

    const res = await this.client.chat.completions.create({
      model,
      messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
      ...(request.temperature !== undefined ? { temperature: request.temperature } : {}),
      ...(request.maxTokens ? { max_completion_tokens: request.maxTokens } : {}),
      ...(request.json ? { response_format: { type: "json_object" as const } } : {}),
    });

    const choice = res.choices[0];
    return {
      content: choice?.message?.content ?? "",
      usage: {
        promptTokens: res.usage?.prompt_tokens ?? 0,
        completionTokens: res.usage?.completion_tokens ?? 0,
        totalTokens: res.usage?.total_tokens ?? 0,
      },
      model: res.model,
      provider: this.id,
    };
  }
}
