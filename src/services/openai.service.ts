import OpenAI from 'openai';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';
import { Message } from './context.service';

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async chat(
    messages: Message[],
    systemPrompt: string,
    functions?: any[]
  ): Promise<{ message: string; functionCall?: any }> {
    try {
      const formattedMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      const params: any = {
        model: env.OPENAI_MODEL,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 500,
      };

      if (functions && functions.length > 0) {
        params.functions = functions;
        params.function_call = 'auto';
      }

      const response = await this.client.chat.completions.create(params);

      const choice = response.choices[0];

      if (choice.message.function_call) {
        return {
          message: choice.message.content || '',
          functionCall: {
            name: choice.message.function_call.name,
            arguments: JSON.parse(choice.message.function_call.arguments),
          },
        };
      }

      return {
        message: choice.message.content || 'Desculpe, não consegui processar sua mensagem.',
      };
    } catch (error) {
      logger.error('Erro ao processar com OpenAI:', error);
      throw new Error('Erro ao processar mensagem com IA');
    }
  }
}

export const openaiService = new OpenAIService();
