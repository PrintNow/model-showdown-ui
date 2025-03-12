import OpenAI from 'openai';

interface OpenAIConfig {
  apiKey: string;
  baseApi?: string;
  dangerouslyAllowBrowser?: boolean;
}

export interface ChatResponse {
  content: string;
  score: number;
  responseTime: number;
  totalTokens: number;
}

export class OpenAIClient {
  private client: OpenAI;

  constructor(config: OpenAIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseApi,
      dangerouslyAllowBrowser: config.dangerouslyAllowBrowser,
    });
  }

  async chat(message: string, systemPrompt: string, model: string): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      const {data: completion, response: {headers}} = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        model,
      }).withResponse();

      const responseTimeFromHeader = parseInt(headers.get('x-one-api-upstream-time') || '0');

      return {
        content: completion.choices[0]?.message?.content || '',
        score: completion.choices[0]?.finish_reason === 'stop' ? 1 : 0,
        responseTime: responseTimeFromHeader > 0 ? responseTimeFromHeader : Date.now() - startTime,
        totalTokens: completion.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
} 