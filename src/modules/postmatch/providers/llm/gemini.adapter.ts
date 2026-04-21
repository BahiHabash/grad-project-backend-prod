import {
  GoogleGenerativeAI,
  type GenerativeModel,
  type GenerateContentResult,
} from '@google/generative-ai';
import { LlmAdapter } from './llm-adapter.interface';
import {
  LLM_ADAPTER_TIMEOUT_MS,
  LLM_TEMPERATURE,
  LLM_MAX_TOKENS,
} from '../../constants/postmatch.constants';
import { withTimeout } from '../../../../common/utils/timeout.util';

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

  /**
   * Sends a prompt to Gemini and returns the generated explanation.
   *
   * @param prompt - The full prompt including the raw analysis data.
   * @returns Generated text and the model name used.
   * @throws Error if Gemini returns an empty response or times out.
   */
  async explain(prompt: string): Promise<{ text: string; model: string }> {
    const result = await withTimeout<GenerateContentResult>(
      this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: LLM_TEMPERATURE,
          maxOutputTokens: LLM_MAX_TOKENS,
        },
      }),
      LLM_ADAPTER_TIMEOUT_MS,
      'Gemini request',
    );

    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Gemini returned an empty response.');
    }

    return { text, model: this.modelName };
  }
}
