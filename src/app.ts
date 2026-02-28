import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.config';
import { logger } from './utils/logger';
import { WebhookController } from './controllers/webhook.controller';
import { redis } from './config/redis.config';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.post('/webhook/evolution', WebhookController.handleEvolutionWebhook);
app.get('/health', WebhookController.healthCheck);

app.get('/', (_req, res) => {
  res.json({
    name: 'Dentista Bot WhatsApp',
    version: '1.0.0',
    status: 'running',
  });
});

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`📱 Webhook disponível em: http://localhost:${PORT}/webhook/evolution`);
  logger.info(`🏥 Clínica: ${env.CLINIC_NAME}`);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM recebido. Encerrando servidor...');
  
  server.close(async () => {
    logger.info('Servidor HTTP encerrado');
    
    try {
      await redis.quit();
      logger.info('Conexão Redis encerrada');
    } catch (error) {
      logger.error('Erro ao encerrar Redis:', error);
    }
    
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recebido. Encerrando servidor...');
  
  server.close(async () => {
    logger.info('Servidor HTTP encerrado');
    
    try {
      await redis.quit();
      logger.info('Conexão Redis encerrada');
    } catch (error) {
      logger.error('Erro ao encerrar Redis:', error);
    }
    
    process.exit(0);
  });
});

export default app;
