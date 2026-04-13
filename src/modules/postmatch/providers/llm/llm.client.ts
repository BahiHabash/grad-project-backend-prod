import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import * as fs from 'fs';
import * as path from 'path';
import { LlmAdapter } from './llm-adapter.interface';
import { GeminiAdapter } from './gemini.adapter';
import { GroqAdapter } from './groq.adapter';

/**
 * Orchestrates LLM calls across multiple adapters with automatic fallback.
 *
 * Adapter priority: Gemini keys (in order) → Groq key (fallback).
 * If ALL adapters fail, returns null (graceful degradation).
 *
 * The PostmatchService treats null as "LLM unavailable"
 * and sets report status to PARTIAL.
 */
@Injectable()
export class LlmClient {
  private readonly adapters: LlmAdapter[] = [];
  private readonly promptTemplate: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.adapters = this.buildAdapterChain();
    this.promptTemplate = this.loadPromptTemplate();

    this.logger.info(
      `LlmClient initialized with ${this.adapters.length} adapter(s): [${this.adapters.map((a) => a.name).join(', ')}]`,
    );
  }

  /**
   * Generates a human-readable explanation from a raw AI analysis.
   *
   * Loops through all registered adapters. First success wins.
   * Returns null if ALL adapters fail (never throws).
   *
   * @param rawAnalysis - The structured JSON from the AI service.
   * @returns An object with { text, model } or null on failure.
   */
  async explain(
    rawAnalysis: object,
  ): Promise<{ text: string; model: string } | null> {
    if (this.adapters.length === 0) {
      this.logger.warn('No LLM adapters configured. Skipping explanation.');
      return null;
    }

    const prompt = this.buildPrompt(rawAnalysis);

    for (const adapter of this.adapters) {
      try {
        this.logger.info(`Trying LLM adapter: ${adapter.name}`);
        const result = await adapter.explain(prompt);
        this.logger.info(
          `LLM adapter ${adapter.name} succeeded (${result.text.length} chars).`,
        );
        return result;
      } catch (error: unknown) {
        this.logger.warn(
          `LLM adapter ${adapter.name} failed: ${this.formatError(error)}`,
        );
        continue;
      }
    }

    this.logger.error('All LLM adapters failed. Returning null.');
    return null;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────

  /**
   * Builds the ordered adapter chain from environment variables.
   *
   * GEMINI_API_KEYS (comma-separated) → one GeminiAdapter per key.
   * GROQ_API_KEY (single) → one GroqAdapter at the end.
   */
  private buildAdapterChain(): LlmAdapter[] {
    const adapters: LlmAdapter[] = [];

    // --- Gemini adapters ---
    const geminiKeys = this.configService.get<string>('GEMINI_API_KEYS');

    if (geminiKeys) {
      const geminiModel = this.configService.get<string>('GEMINI_MODEL');
      if (!geminiModel) {
        this.logger.error(
          'GEMINI_MODEL is missing while GEMINI_API_KEYS is provided. Skipping Gemini adapters.',
        );
      } else {
        const keys = geminiKeys
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length > 0);

        this.logger.info(`Registered ${keys.length} Gemini adapter(s).`);
        keys.forEach((key, index) => {
          adapters.push(new GeminiAdapter(key, geminiModel, index + 1));
        });
      }
    }

    // --- Groq adapter (fallback) ---
    const groqKey = this.configService.get<string>('GROQ_API_KEY');
    const groqModel = this.configService.get<string>('GROQ_MODEL');

    if (groqKey && groqModel) {
      adapters.push(new GroqAdapter(groqKey, groqModel));
      this.logger.info('Registered Groq adapter (fallback).');
    } else if (groqKey && !groqModel) {
      this.logger.error(
        'GROQ_MODEL is missing while GROQ_API_KEY is provided. Skipping Groq adapter.',
      );
    }

    return adapters;
  }

  /**
   * Loads the prompt template from the templates directory.
   * Falls back to an inline template if the file is not found.
   */
  private loadPromptTemplate(): string {
    const templatePath = path.join(
      __dirname,
      '..',
      '..',
      'templates',
      'analysis-prompt.txt',
    );

    try {
      const template = fs.readFileSync(templatePath, 'utf-8');
      this.logger.info('Prompt template loaded from file.');
      return template;
    } catch {
      this.logger.warn(
        'Prompt template file not found. Using inline fallback.',
      );
      return [
        'You are an expert football tactical analyst.',
        'Below is a structured post-match analysis produced by an AI system.',
        'Generate a clear, professional, and insightful explanation in plain English.',
        '',
        'RULES:',
        '- Reference ONLY data that exists in the input below. Do NOT invent statistics, player names, or facts.',
        '- Be specific — mention player names, positions, fatigue scores, and drill codes from the data.',
        '- Structure your response with clear headings: Match Overview, Player Analysis, Training Recommendations.',
        '- Keep the tone professional and analytical.',
        '',
        'Match Analysis Data:',
        '{{RAW_ANALYSIS_JSON}}',
      ].join('\n');
    }
  }

  /**
   * Injects the raw analysis JSON into the prompt template.
   */
  private buildPrompt(rawAnalysis: object): string {
    return this.promptTemplate.replace(
      '{{RAW_ANALYSIS_JSON}}',
      JSON.stringify(rawAnalysis, null, 2),
    );
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'Unknown error';
  }
}
