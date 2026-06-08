/**
 * Request parser for incoming requests
 */

import { Logger } from '../logging/logger.js';

export interface ParsedRequest {
  type: 'generate' | 'analyze' | 'test' | 'debug' | 'refactor' | 'unknown';
  input: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

export class RequestParser {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('RequestParser');
  }

  parse(input: string): ParsedRequest {
    try {
      const normalized = input.toLowerCase().trim();

      // Simple pattern matching for intent detection
      let type: ParsedRequest['type'] = 'unknown';

      if (
        normalized.includes('generate') ||
        normalized.includes('write') ||
        normalized.includes('create')
      ) {
        type = 'generate';
      } else if (normalized.includes('analyze') || normalized.includes('analyze')) {
        type = 'analyze';
      } else if (normalized.includes('test')) {
        type = 'test';
      } else if (normalized.includes('debug') || normalized.includes('error')) {
        type = 'debug';
      } else if (normalized.includes('refactor') || normalized.includes('improve')) {
        type = 'refactor';
      }

      const result: ParsedRequest = {
        type,
        input,
      };

      // Extract language if mentioned
      const languages = ['typescript', 'javascript', 'python', 'java', 'go', 'rust'];
      const detectedLang = languages.find((lang) => normalized.includes(lang));
      if (detectedLang) {
        result.language = detectedLang;
      }

      this.logger.debug('Request parsed', result);
      return result;
    } catch (error) {
      this.logger.error('Error parsing request', error);
      throw error;
    }
  }
}
