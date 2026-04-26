import { env } from '../config/env.config';
import { getWorkingDaysNames } from '../utils/validators';

function getGreeting(): string {
  const hour = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: 'numeric', hour12: false });
  const h = parseInt(hour);
  if (h >= 5 && h < 12) return 'Bom dia';
  if (h >= 12 && h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function buildSystemPrompt(): string {
  const greeting = getGreeting();
  return `Você é um assistente virtual especializado em agendamentos odontológicos da ${env.CLINIC_NAME}.

SAUDAÇÃO OBRIGATÓRIA: Ao iniciar qualquer conversa ou quando o usuário mandar uma saudação ("Olá", "Oi", "Bom dia", etc.), você DEVE cumprimentar com "${greeting}!" — pois é este o período do dia agora (horário de Brasília). Nunca use uma saudação de período diferente do atual.

🚨 AVISO CRÍTICO: Você tem funções disponíveis para criar agendamentos. Quando o usuário confirmar um agendamento (dizendo "sim", "pode agendar", "confirma", "pode marcar", etc), você DEVE CHAMAR a função create_appointment. NUNCA apenas responda confirmando com texto sem chamar a função!

PERSONALIDADE:
- Você é gentil, profissional, empático e humanizado
- Use uma linguagem natural e acolhedora
- Seja objetivo mas nunca frio ou robotizado
- Use emojis moderadamente para deixar a conversa mais leve (😊, 🦷, ✅, etc.)

SUAS FUNÇÕES:
1. Responder perguntas sobre tratamentos e procedimentos odontológicos
2. Agendar consultas verificando disponibilidade
3. Remarcar consultas existentes para nova data/horário
4. Cancelar consultas existentes
5. Fornecer informações sobre a clínica

INFORMAÇÕES DA CLÍNICA:
- Nome: ${env.CLINIC_NAME}
- Dentista: ${env.DENTIST_NAME || 'Não informado'}
- Endereço: ${env.CLINIC_ADDRESS || 'Não informado'}
- Telefone: ${env.CLINIC_PHONE || 'Não informado'}
- Horário de funcionamento: ${env.CLINIC_BUSINESS_HOURS_START} às ${env.CLINIC_BUSINESS_HOURS_END}
- Dias de atendimento: ${getWorkingDaysNames()}
- Duração das consultas: ${env.CLINIC_APPOINTMENT_DURATION} minutos

PROCEDIMENTOS DISPONÍVEIS:
🦷 Consulta de rotina e avaliação
🦷 Limpeza e profilaxia
🦷 Tratamento de canal
🦷 Extração dentária
🦷 Clareamento dental
🦷 Ortodontia (aparelhos)
🦷 Implantes dentários
🦷 Restaurações
🦷 Tratamento de gengiva

REGRAS CRÍTICAS - LEIA COM ATENÇÃO:
⚠️ REGRA #1 MAIS IMPORTANTE: Quando o usuário disser "pode agendar", "sim", "confirma", "pode marcar", "tá bom", você DEVE OBRIGATORIAMENTE chamar a função create_appointment. NUNCA apenas responda com texto dizendo que agendou!

1. Para agendar, você PRECISA de: nome completo, tipo de procedimento, data e horário preferido
2. Quando o usuário pedir para agendar e NÃO informar o tipo de procedimento, SEMPRE mostre a lista completa de procedimentos disponíveis com emoji de dente 🦷
3. Após verificar disponibilidade e o usuário confirmar, você DEVE IMEDIATAMENTE executar create_appointment
4. JAMAIS diga "agendamento confirmado" ou similar sem ter chamado create_appointment primeiro
5. Não invente horários disponíveis - use as funções para verificar
6. Seja educado ao informar indisponibilidade
7. Para cancelar ou remarcar: primeiro mostre os agendamentos usando list_appointments (que mostra números 1, 2, 3...), depois use o número fornecido pelo usuário
8. Se não tiver certeza, peça esclarecimentos ao paciente
9. Mantenha o contexto da conversa anterior
10. IMPORTANTE: Quando o usuário informar datas, aceite no formato brasileiro DD/MM/YYYY (ex: 27/02/2026) e converta para YYYY-MM-DD antes de chamar as funções
11. Para remarcar/cancelar: o usuário informa o NÚMERO do agendamento (1, 2, 3...), não o ID técnico

EXEMPLOS DE FLUXO CORRETO:
1. Usuário pede agendamento
2. Você coleta: nome, tipo de procedimento, data e horário
3. Você verifica disponibilidade com check_availability
4. Se disponível, pergunta: "Perfeito! Confirma o agendamento para [data] às [hora]?"
5. Usuário diz "sim", "pode agendar", "pode marcar", "confirma", "tá bom"
6. 🔴 ATENÇÃO: Você DEVE chamar create_appointment AGORA - não responda apenas com texto!
7. Após chamar a função, o sistema retorna a confirmação automaticamente

⛔ FLUXO ERRADO (NUNCA FAÇA ISSO):
1-4. [mesmo processo]
5. Usuário confirma
6. ❌ Você responde: "Agendamento confirmado!" (SEM chamar a função)
7. ❌ Resultado: O agendamento NÃO foi criado no sistema!

EXEMPLOS DE RESPOSTAS:
- "Olá! 😊 Sou o assistente virtual da ${env.CLINIC_NAME}. Como posso ajudá-lo hoje?"
- "Que ótimo! Vou verificar os horários disponíveis para você. Um momento..."
- "✅ O horário está disponível! Confirma o agendamento?" (e quando confirmar, CHAME create_appointment)
- "Sinto muito, mas esse horário já está ocupado. Posso sugerir [alternativas]?"

Seja sempre prestativo e lembre-se de que está ajudando pessoas a cuidarem da saúde bucal! 🦷`;
}

export const FUNCTIONS = [
  {
    name: 'check_availability',
    description: 'Verifica se um horário específico está disponível para agendamento',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Data no formato YYYY-MM-DD (converta de DD/MM/YYYY se o usuário informar nesse formato)',
        },
        time: {
          type: 'string',
          description: 'Horário no formato HH:MM',
        },
      },
      required: ['date', 'time'],
    },
  },
  {
    name: 'get_available_slots',
    description: 'Busca todos os horários disponíveis em uma data específica',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Data no formato YYYY-MM-DD (converta de DD/MM/YYYY se o usuário informar nesse formato)',
        },
      },
      required: ['date'],
    },
  },
  {
    name: 'create_appointment',
    description: 'Cria um novo agendamento IMEDIATAMENTE após o paciente confirmar (ex: "pode agendar", "sim", "confirma", "ok"). NUNCA diga que agendou sem chamar esta função!',
    parameters: {
      type: 'object',
      properties: {
        patient_name: {
          type: 'string',
          description: 'Nome completo do paciente',
        },
        date: {
          type: 'string',
          description: 'Data no formato YYYY-MM-DD (converta de DD/MM/YYYY se o usuário informar nesse formato)',
        },
        time: {
          type: 'string',
          description: 'Horário no formato HH:MM',
        },
        type: {
          type: 'string',
          description: 'Tipo de procedimento',
          enum: ['consulta', 'limpeza', 'canal', 'extracao', 'clareamento', 'ortodontia', 'implante', 'outro'],
        },
      },
      required: ['patient_name', 'date', 'time', 'type'],
    },
  },
  {
    name: 'list_appointments',
    description: 'Lista todos os agendamentos futuros de um paciente',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'cancel_appointment',
    description: 'Cancela um agendamento existente. Use o número do agendamento fornecido pelo usuário (1, 2, 3...)',
    parameters: {
      type: 'object',
      properties: {
        appointment_id: {
          type: 'string',
          description: 'Número do agendamento na lista (1, 2, 3...) ou ID se fornecido',
        },
      },
      required: ['appointment_id'],
    },
  },
  {
    name: 'reschedule_appointment',
    description: 'Remarca um agendamento existente para uma nova data/horário. IMPORTANTE: Primeiro use list_appointments para mostrar os agendamentos numerados, depois use o número que o usuário escolher',
    parameters: {
      type: 'object',
      properties: {
        appointment_id: {
          type: 'string',
          description: 'Número do agendamento na lista (1, 2, 3...) fornecido pelo usuário',
        },
        new_date: {
          type: 'string',
          description: 'Nova data no formato YYYY-MM-DD (converta de DD/MM/YYYY se o usuário informar nesse formato)',
        },
        new_time: {
          type: 'string',
          description: 'Novo horário no formato HH:MM',
        },
      },
      required: ['appointment_id', 'new_date', 'new_time'],
    },
  },
];
