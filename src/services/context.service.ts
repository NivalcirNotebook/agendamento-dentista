import { redis } from '../config/redis.config';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface UserContext {
  phone: string;
  name?: string;
  messages: Message[];
  pendingAppointments?: string[];
  lastInteraction: number;
}

export class ContextService {
  private static readonly PREFIX = 'chat:';
  private static readonly MAX_MESSAGES = 15;

  static async saveMessage(phone: string, role: Message['role'], content: string): Promise<void> {
    try {
      const key = this.getKey(phone);
      const context = await this.getContext(phone);

      const message: Message = {
        role,
        content,
        timestamp: Date.now(),
      };

      context.messages.push(message);

      if (context.messages.length > this.MAX_MESSAGES) {
        context.messages = context.messages.slice(-this.MAX_MESSAGES);
      }

      context.lastInteraction = Date.now();

      await redis.setex(key, env.CONTEXT_TTL, JSON.stringify(context));
    } catch (error) {
      logger.error('Erro ao salvar mensagem no contexto:', error);
      throw error;
    }
  }

  static async getContext(phone: string): Promise<UserContext> {
    try {
      const key = this.getKey(phone);
      const data = await redis.get(key);

      if (data) {
        return JSON.parse(data);
      }

      return {
        phone,
        messages: [],
        lastInteraction: Date.now(),
      };
    } catch (error) {
      logger.error('Erro ao recuperar contexto:', error);
      return {
        phone,
        messages: [],
        lastInteraction: Date.now(),
      };
    }
  }

  static async updateUserName(phone: string, name: string): Promise<void> {
    try {
      const key = this.getKey(phone);
      const context = await this.getContext(phone);
      context.name = name;
      await redis.setex(key, env.CONTEXT_TTL, JSON.stringify(context));
    } catch (error) {
      logger.error('Erro ao atualizar nome do usuário:', error);
    }
  }

  static async addPendingAppointment(phone: string, appointmentId: string): Promise<void> {
    try {
      const key = this.getKey(phone);
      const context = await this.getContext(phone);
      
      if (!context.pendingAppointments) {
        context.pendingAppointments = [];
      }
      
      context.pendingAppointments.push(appointmentId);
      await redis.setex(key, env.CONTEXT_TTL, JSON.stringify(context));
    } catch (error) {
      logger.error('Erro ao adicionar agendamento pendente:', error);
    }
  }

  static async removePendingAppointment(phone: string, appointmentId: string): Promise<void> {
    try {
      const key = this.getKey(phone);
      const context = await this.getContext(phone);
      
      if (context.pendingAppointments) {
        context.pendingAppointments = context.pendingAppointments.filter(id => id !== appointmentId);
      }
      
      await redis.setex(key, env.CONTEXT_TTL, JSON.stringify(context));
    } catch (error) {
      logger.error('Erro ao remover agendamento pendente:', error);
    }
  }

  static async clearContext(phone: string): Promise<void> {
    try {
      const key = this.getKey(phone);
      await redis.del(key);
      logger.info(`Contexto limpo para: ${phone}`);
    } catch (error) {
      logger.error('Erro ao limpar contexto:', error);
    }
  }

  private static getKey(phone: string): string {
    return `${this.PREFIX}${phone}`;
  }
}
