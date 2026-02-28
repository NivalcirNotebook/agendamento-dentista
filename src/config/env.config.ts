import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  EVOLUTION_API_URL: z.string().url(),
  EVOLUTION_API_KEY: z.string().min(1),
  EVOLUTION_INSTANCE_NAME: z.string().min(1),
  
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default('gpt-4-turbo'),
  
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALENDAR_ID: z.string().optional().default('primary'),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  GOOGLE_REFRESH_TOKEN: z.string().optional(),
  
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),
  
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  CLINIC_NAME: z.string().default('Clínica Odontológica'),
  CLINIC_ADDRESS: z.string().default(''),
  CLINIC_PHONE: z.string().default(''),
  DENTIST_NAME: z.string().default(''),
  CLINIC_BUSINESS_HOURS_START: z.string().default('08:00'),
  CLINIC_BUSINESS_HOURS_END: z.string().default('18:00'),
  CLINIC_APPOINTMENT_DURATION: z.string().transform(Number).default('30'),
  CLINIC_WORKING_DAYS: z.string().default('1,2,3,4,5'),
  CLINIC_HOLIDAYS: z.string().default(''),
  
  CONTEXT_TTL: z.string().transform(Number).default('604800'),
});

type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig;

try {
  envConfig = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Erro na validação das variáveis de ambiente:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const env = envConfig;
