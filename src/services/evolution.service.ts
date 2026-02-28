import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';

export interface EvolutionMessage {
  key: {
    remoteJid: string;
    fromMe: boolean;
    id: string;
  };
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
  messageTimestamp: number;
  pushName?: string;
}

export class EvolutionService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.EVOLUTION_API_URL,
      headers: {
        'apikey': env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async sendTextMessage(phone: string, text: string): Promise<void> {
    try {
      const payload = {
        number: phone,
        text: text,
      };

      await this.client.post(`/message/sendText/${env.EVOLUTION_INSTANCE_NAME}`, payload);
      logger.info(`Mensagem enviada para ${phone}`);
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      throw new Error('Falha ao enviar mensagem via WhatsApp');
    }
  }

  async sendTyping(phone: string, duration: number = 2000): Promise<void> {
    try {
      await this.client.post(`/chat/sendPresence/${env.EVOLUTION_INSTANCE_NAME}`, {
        number: phone,
        presence: 'composing',
        delay: duration,
      });
    } catch (error) {
      logger.error('Erro ao enviar status de digitação:', error);
    }
  }

  extractMessageText(message: EvolutionMessage): string | null {
    if (message.message.conversation) {
      return message.message.conversation;
    }
    
    if (message.message.extendedTextMessage?.text) {
      return message.message.extendedTextMessage.text;
    }
    
    return null;
  }

  extractPhone(message: EvolutionMessage): string {
    return message.key.remoteJid.replace('@s.whatsapp.net', '');
  }

  extractName(message: EvolutionMessage): string | undefined {
    return message.pushName;
  }

  isFromMe(message: EvolutionMessage): boolean {
    return message.key.fromMe;
  }

  async getInstanceStatus(): Promise<boolean> {
    try {
      logger.info(`Verificando status da instância: ${env.EVOLUTION_INSTANCE_NAME}`);
      logger.info(`URL base: ${env.EVOLUTION_API_URL}`);
      
      const response = await this.client.get(`/instance/fetchInstances`);
      logger.info('Resposta da Evolution API:', JSON.stringify(response.data, null, 2));
      
      if (Array.isArray(response.data)) {
        const instance = response.data.find((inst: any) => 
          inst.instance?.instanceName === env.EVOLUTION_INSTANCE_NAME
        );
        
        if (instance) {
          const isConnected = instance.instance?.state === 'open';
          logger.info(`Instância encontrada. Estado: ${instance.instance?.state}`);
          return isConnected;
        }
        
        logger.warn(`Instância ${env.EVOLUTION_INSTANCE_NAME} não encontrada na lista`);
        return false;
      }
      
      const isConnected = response.data?.state === 'open' || response.data?.instance?.state === 'open';
      logger.info(`Estado da conexão: ${isConnected}`);
      return isConnected;
    } catch (error: any) {
      logger.error('Erro ao verificar status da instância:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return false;
    }
  }
}

export const evolutionService = new EvolutionService();
