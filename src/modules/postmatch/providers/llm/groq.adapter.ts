import Groq from 'groq-sdk';
import { LlmAdapter } from './llm-adapter.interface';
import {
  LLM_ADAPTER_TIMEOUT_MS,
  LLM_TEMPERATURE,
  LLM_MAX_TOKENS,
} from '../../constants/postmatch.constants';
import { withTimeout } from '../../../../common/utils/timeout.util';

export class GroqAdapter implements LlmAdapter {
  readonly name = 'groq-key-1';
  private readonly client: Groq;
  private readonly modelName: string;

  constructor(apiKey: string, modelName: string) {
    this.client = new Groq({ apiKey });
    this.modelName = modelName;
  }

  /**
   * Sends a prompt to Groq and returns the generated explanation.
   *
   * @param prompt - The full prompt including the raw analysis data.
   * @returns Generated text and the model name used.
   * @throws Error if Groq returns an empty response or times out.
   */
  async explain(prompt: string): Promise<{ text: string; model: string }> {
    const response = await withTimeout(
      this.client.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: LLM_TEMPERATURE,
        max_tokens: LLM_MAX_TOKENS,
      }),
      LLM_ADAPTER_TIMEOUT_MS,
      'Groq request',
    );

    const text = response.choices?.[0]?.message?.content;

    if (!text || text.trim().length === 0) {
      throw new Error('Groq returned an empty response.');
    }

    return { text, model: this.modelName };
  }
}
