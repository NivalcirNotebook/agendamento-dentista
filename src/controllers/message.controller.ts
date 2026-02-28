import { evolutionService } from '../services/evolution.service';
import { dentistAgent } from '../agents/dentist.agent';
import { logger } from '../utils/logger';

export class MessageController {
  static async processIncomingMessage(
    phone: string,
    text: string,
    name?: string
  ): Promise<void> {
    try {
      logger.info(`Mensagem recebida de ${phone}: ${text}`);

      await evolutionService.sendTyping(phone, 3000);

      const response = await dentistAgent.processMessage(phone, text, name);

      await evolutionService.sendTextMessage(phone, response);

      logger.info(`Resposta enviada para ${phone}`);
    } catch (error) {
      logger.error('Erro ao processar mensagem:', error);

      try {
        await evolutionService.sendTextMessage(
          phone,
          'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns instantes.'
        );
      } catch (sendError) {
        logger.error('Erro ao enviar mensagem de erro:', sendError);
      }
    }
  }
}
