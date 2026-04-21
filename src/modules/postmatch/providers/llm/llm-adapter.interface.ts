/**
 * Common interface for all LLM adapters.
 *
 * Each adapter wraps a single API key for a single provider.
 * The LlmClient loops through adapters in order until one succeeds.
 */
export interface LlmAdapter {
  /** Human-readable identifier for logging. */
  readonly name: string;

  /**
   * Sends a prompt to the LLM and returns the generated text.
   *
   * @param prompt - The full prompt including the raw analysis data.
   * @returns Generated explanation text with the model name used.
   * @throws Any error on failure. The LlmClient catches and moves to the next adapter.
   */
  explain(prompt: string): Promise<{ text: string; model: string }>;
}
