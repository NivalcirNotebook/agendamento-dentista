import { google } from 'googleapis';
import { env } from './env.config';
import { logger } from '../utils/logger';

const isGoogleConfigured = !!(
  env.GOOGLE_CLIENT_ID &&
  env.GOOGLE_CLIENT_SECRET &&
  env.GOOGLE_REDIRECT_URI
);

let oauth2Client: any = null;
let calendar: any = null;

if (isGoogleConfigured) {
  oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );

  if (env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
    });
    
    // Listener para refresh automático de token
    oauth2Client.on('tokens', (tokens: any) => {
      if (tokens.refresh_token) {
        logger.info('Novo refresh token obtido');
      }
      if (tokens.access_token) {
        logger.debug('Access token atualizado');
      }
    });
    
    logger.info('Google Calendar configurado com sucesso');
  } else {
    logger.warn('GOOGLE_REFRESH_TOKEN não definido - autenticação pode falhar');
  }

  calendar = google.calendar({ version: 'v3', auth: oauth2Client });
}

export { calendar, oauth2Client as googleAuth, isGoogleConfigured };

export function getAuthUrl(): string {
  if (!isGoogleConfigured || !oauth2Client) {
    throw new Error('Google Calendar não está configurado');
  }
  
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

export async function setTokenFromCode(code: string): Promise<void> {
  if (!isGoogleConfigured || !oauth2Client) {
    throw new Error('Google Calendar não está configurado');
  }
  
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  if (tokens.refresh_token) {
    console.log('✅ Refresh Token obtido. Adicione ao .env:');
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
  }
}
