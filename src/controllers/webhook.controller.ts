import { Request, Response } from 'express';
import { evolutionService, EvolutionMessage } from '../services/evolution.service';
import { MessageController } from './message.controller';
import { logger } from '../utils/logger';

export class WebhookController {
  static async handleEvolutionWebhook(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data || !data.data) {
        res.status(400).json({ error: 'Dados inválidos' });
        return;
      }

      const message: EvolutionMessage = data.data;

      if (evolutionService.isFromMe(message)) {
        res.status(200).json({ message: 'Mensagem ignorada (enviada por mim)' });
        return;
      }

      const text = evolutionService.extractMessageText(message);
      
      if (!text) {
        res.status(200).json({ message: 'Tipo de mensagem não suportado' });
        return;
      }

      const phone = evolutionService.extractPhone(message);
      const name = evolutionService.extractName(message);

      res.status(200).json({ message: 'Mensagem recebida' });

      setImmediate(() => {
        MessageController.processIncomingMessage(phone, text, name);
      });
    } catch (error) {
      logger.error('Erro no webhook:', error);
      res.status(500).json({ error: 'Erro ao processar webhook' });
    }
  }

  static async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      const isConnected = await evolutionService.getInstanceStatus();
      
      res.status(200).json({
        status: 'ok',
        evolution: isConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: 'Falha ao verificar status',
      });
    }
  }
}
