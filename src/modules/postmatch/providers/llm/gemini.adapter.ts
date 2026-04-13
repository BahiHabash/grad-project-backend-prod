import {
  GoogleGenerativeAI,
  type GenerativeModel,
  type GenerateContentResult,
} from '@google/generative-ai';
import { LlmAdapter } from './llm-adapter.interface';
import { LLM_ADAPTER_TIMEOUT_MS } from '../../constants/postmatch.constants';

/**
 * LLM adapter for Google Gemini.
 *
 * Each instance wraps a single API key.
 * Create multiple instances with different keys for key-rotation.
 */
export class GeminiAdapter implements LlmAdapter {
  readonly name: string;
  private readonly model: GenerativeModel;
  private readonly modelName: string;

  constructor(apiKey: string, modelName: string, keyIndex: number) {
    this.name = `gemini-key-${keyIndex}`;
    this.modelName = modelName;
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel(
      { model: modelName },
      { apiVersion: 'v1', timeout: LLM_ADAPTER_TIMEOUT_MS },
    );
  }

  async explain(prompt: string): Promise<{ text: string; model: string }> {
    const result = await this.withTimeout<GenerateContentResult>(
      this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      }),
    );

    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Gemini returned an empty response.');
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
            `Gemini request timed out after ${LLM_ADAPTER_TIMEOUT_MS}ms.`,
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
