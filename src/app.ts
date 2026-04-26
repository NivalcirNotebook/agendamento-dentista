import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
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

app.get('/oauth2callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send('Código de autorização não encontrado.');
    return;
  }
  try {
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (refreshToken) {
      const envPath = path.resolve(process.cwd(), '.env');
      let envContent = fs.readFileSync(envPath, 'utf-8');
      envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/, `GOOGLE_REFRESH_TOKEN=${refreshToken}`);
      fs.writeFileSync(envPath, envContent);
      logger.info('✅ Novo refresh token salvo no .env com sucesso!');
      res.send('<h2>✅ Autenticação concluída!</h2><p>Novo refresh token salvo. Pode fechar esta aba.</p>');
    } else {
      res.send('<h2>⚠️ Token recebido mas sem refresh_token.</h2><p>Tente novamente.</p>');
    }
  } catch (error: any) {
    logger.error('Erro no OAuth2 callback:', error.message);
    res.status(500).send(`<h2>❌ Erro: ${error.message}</h2>`);
  }
});

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
