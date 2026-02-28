# 🚀 Guia Rápido de Configuração

## Passo a Passo para Colocar o Bot no Ar

### 1️⃣ Instalar Dependências

```bash
npm install
```

### 2️⃣ Configurar Arquivo .env

Copie e edite o arquivo de exemplo:

```bash
cp .env.example .env
```

**Mínimo necessário para começar:**

```env
# Evolution API (obrigatório)
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api
EVOLUTION_INSTANCE_NAME=dentista-bot

# OpenAI (obrigatório)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo

# Redis (obrigatório)
REDIS_HOST=seu-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=sua-senha
```

### 3️⃣ Configurar Google Calendar

#### Opção A: Configuração Completa

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto
3. Ative a Google Calendar API
4. Crie credenciais OAuth2
5. Execute: `npm run auth:google`
6. Siga as instruções e copie o GOOGLE_REFRESH_TOKEN para o .env

#### Opção B: Pular Temporariamente

Para testar sem Google Calendar, comente as validações no arquivo `.env.example` relacionadas ao Google.

### 4️⃣ Configurar Webhook na Evolution API

1. Acesse a interface da sua Evolution API
2. Vá em configurações de webhook
3. Configure:
   - **URL**: `http://seu-servidor:3000/webhook/evolution`
   - **Eventos**: `message.received`

### 5️⃣ Iniciar o Bot

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

### 6️⃣ Verificar se Está Funcionando

Abra no navegador: `http://localhost:3000/health`

Resposta esperada:
```json
{
  "status": "ok",
  "evolution": "connected",
  "timestamp": "2026-02-25T22:00:00.000Z"
}
```

### 7️⃣ Testar no WhatsApp

Envie uma mensagem para o número conectado na Evolution API:

```
Olá
```

O bot deve responder com uma mensagem de boas-vindas!

## ⚠️ Troubleshooting Rápido

### Erro: "Cannot find module..."
```bash
npm install
```

### Bot não responde
1. Verifique se Evolution API está conectada
2. Verifique se webhook está configurado
3. Verifique logs em `logs/error.log`

### Erro no Redis
1. Verifique se Redis está rodando
2. Verifique credenciais no .env

### Erro na OpenAI
1. Verifique se API Key é válida
2. Verifique se tem créditos na conta

## 📊 Estrutura de Custos Mensais

- Evolution API: R$ 0-50
- OpenAI (GPT-4): R$ 50-200
- Hospedagem: R$ 0-30
- Redis: R$ 0 (incluído)

**Total**: ~R$ 50-280/mês

## 🎯 Próximos Passos

1. ✅ Configurar informações da clínica no .env
2. ✅ Testar fluxo de agendamento
3. ✅ Testar cancelamento
4. ✅ Personalizar prompts em `src/agents/prompts.ts`
5. ✅ Configurar lembretes (futuro)
6. ✅ Deploy em produção

## 📞 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Autenticação Google
npm run auth:google

# Lint
npm run lint

# Format
npm run format
```

## 🔧 Personalização Rápida

### Alterar Horário de Atendimento

No `.env`:
```env
CLINIC_BUSINESS_HOURS_START=08:00
CLINIC_BUSINESS_HOURS_END=18:00
```

### Alterar Duração das Consultas

No `.env`:
```env
CLINIC_APPOINTMENT_DURATION=30  # minutos
```

### Personalizar Respostas da IA

Edite o arquivo: `src/agents/prompts.ts`

---

**Dúvidas?** Consulte o README.md completo!
