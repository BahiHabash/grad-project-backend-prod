import Groq from 'groq-sdk';
import { LlmAdapter } from './llm-adapter.interface';
import { LLM_ADAPTER_TIMEOUT_MS } from '../../constants/postmatch.constants';

/**
 * LLM adapter for Groq (Llama, Mixtral, etc.).
 *
 * Used as a fallback when all Gemini keys are exhausted.
 */
export class GroqAdapter implements LlmAdapter {
  readonly name = 'groq-key-1';
  private readonly client: Groq;
  private readonly modelName: string;

  constructor(apiKey: string, modelName: string) {
    this.client = new Groq({ apiKey });
    this.modelName = modelName;
  }

  async explain(prompt: string): Promise<{ text: string; model: string }> {
    const response = await this.withTimeout(
      this.client.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    );

    const text = response.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error('Groq returned an empty response.');
    }

    return { text, model: this.modelName };
  }

  /** Enforces a hard timeout so fallback logic can move to the next adapter. */
  private async withTimeout<T>(promise: Promise<T>): Promise<T> {
    let timeoutHandle: NodeJS.Timeout | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(
          new Error(
            `Groq request timed out after ${LLM_ADAPTER_TIMEOUT_MS}ms.`,
          ),
        );
      }, LLM_ADAPTER_TIMEOUT_MS);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  }
}
