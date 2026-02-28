# 🦷 Sistema de Agendamento de Dentistas - Bot WhatsApp

Bot de IA inteligente para gerenciar agendamentos de clínicas odontológicas via WhatsApp, integrado com Google Calendar e Evolution API.

## 🚀 Funcionalidades

- ✅ **Atendimento humanizado com IA**: Respostas naturais usando GPT-4
- 📅 **Agendamento automático**: Verifica disponibilidade e agenda no Google Calendar
- ❌ **Cancelamento de consultas**: Cancela agendamentos facilmente
- 💬 **Contexto persistente**: Mantém histórico de conversas no Redis
- 📱 **WhatsApp integrado**: Comunicação via Evolution API
- ⏰ **Lembretes automáticos**: Notificações pré-consulta

## 📋 Pré-requisitos

- Node.js 18+
- Redis (EasyPanel ou local)
- Conta OpenAI com API Key
- Google Cloud Project (para Calendar API)
- Evolution API configurada e rodando

## 🛠️ Instalação

### 1. Clone e instale dependências

```bash
cd projeto-dentistas
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Evolution API
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api
EVOLUTION_INSTANCE_NAME=dentista-bot

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo

# Google Calendar (veja seção abaixo)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALENDAR_ID=primary
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_REFRESH_TOKEN=

# Redis
REDIS_HOST=seu-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=sua-senha-redis
REDIS_DB=0

# Servidor
PORT=3000
NODE_ENV=production

# Configurações da Clínica
CLINIC_NAME=Clínica Odontológica Exemplo
CLINIC_ADDRESS=Rua Exemplo, 123 - Centro
CLINIC_PHONE=+55 11 99999-9999
CLINIC_BUSINESS_HOURS_START=08:00
CLINIC_BUSINESS_HOURS_END=18:00
CLINIC_APPOINTMENT_DURATION=30
```

### 3. Configure a Google Calendar API

#### Passo 1: Criar projeto no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Calendar API**

#### Passo 2: Criar credenciais OAuth2

1. Vá em **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth client ID**
3. Escolha **Web application**
4. Adicione `http://localhost:3000/oauth2callback` em **Authorized redirect URIs**
5. Salve o **Client ID** e **Client Secret**

#### Passo 3: Obter Refresh Token

Execute o script auxiliar para autenticação:

```bash
npm run auth:google
```

Siga as instruções no terminal:
1. Abra a URL fornecida no navegador
2. Faça login com a conta Google do dentista
3. Autorize o acesso ao calendário
4. Copie o código de autorização
5. Cole no terminal
6. Copie o **Refresh Token** gerado e adicione ao `.env`

### 4. Configure o Evolution API Webhook

Na interface da Evolution API, configure o webhook para:

```
URL: http://seu-servidor:3000/webhook/evolution
Eventos: message.received
```

## 🏃 Executando

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## 📡 Endpoints

- `POST /webhook/evolution` - Recebe mensagens do WhatsApp
- `GET /health` - Verifica status do sistema
- `GET /` - Informações básicas da API

## 🔧 Estrutura do Projeto

```
projeto-dentistas/
├── src/
│   ├── config/           # Configurações (env, redis, google)
│   ├── services/         # Serviços (evolution, openai, calendar, context)
│   ├── agents/           # Agente de IA e prompts
│   ├── controllers/      # Controllers (webhook, message)
│   ├── utils/            # Utilitários (logger, validators, formatters)
│   └── app.ts            # Aplicação principal
├── logs/                 # Logs da aplicação
├── .env                  # Variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

## 💡 Como Funciona

### Fluxo de Agendamento

1. **Usuário envia mensagem** no WhatsApp
2. **Evolution API** envia webhook para o bot
3. **Bot processa** com IA (GPT-4)
4. **IA identifica** intenção de agendamento
5. **Sistema verifica** disponibilidade no Google Calendar
6. **IA sugere** horários disponíveis
7. **Usuário confirma** horário
8. **Sistema cria** evento no Google Calendar
9. **IA confirma** agendamento via WhatsApp

### Fluxo de Cancelamento

1. **Usuário solicita** cancelamento
2. **Sistema lista** agendamentos do telefone
3. **Usuário escolhe** qual cancelar
4. **Sistema remove** do Google Calendar
5. **IA confirma** cancelamento

## 🤖 Capacidades da IA

O agente de IA pode:

- ✅ Responder perguntas sobre tratamentos odontológicos
- ✅ Agendar consultas verificando disponibilidade real
- ✅ Cancelar consultas existentes
- ✅ Listar agendamentos do paciente
- ✅ Sugerir horários alternativos
- ✅ Manter contexto da conversa
- ✅ Extrair informações (nome, data, horário) da linguagem natural

## 📝 Exemplos de Conversas

**Agendamento:**
```
Usuário: Olá, gostaria de agendar uma limpeza
Bot: Olá! 😊 Será um prazer ajudá-lo! Para qual data você prefere?
Usuário: Amanhã de manhã
Bot: Vou verificar os horários disponíveis para amanhã... 
     Horários disponíveis:
     • 08:00
     • 09:00
     • 10:30
     Qual horário prefere?
Usuário: 09:00
Bot: Perfeito! Qual seu nome completo?
Usuário: João Silva
Bot: ✅ Agendamento confirmado com sucesso!
     👤 Paciente: João Silva
     🦷 Tipo: limpeza
     📅 Data: terça-feira, 26 de fevereiro de 2026
     ⏰ Horário: 09:00
```

**Cancelamento:**
```
Usuário: Preciso cancelar minha consulta
Bot: Claro! Vou buscar seus agendamentos...
     📋 Seus agendamentos:
     1. terça-feira, 26 de fevereiro às 09:00
        Tipo: limpeza
        ID: abc123
     Qual deseja cancelar?
Usuário: O primeiro
Bot: ✅ Agendamento cancelado com sucesso!
     Se precisar reagendar, estou à disposição. 😊
```

## 🔒 Segurança

- ✅ Validação de todas as entradas
- ✅ Sanitização de dados no Redis
- ✅ Helmet para segurança HTTP
- ✅ Rate limiting nas APIs externas
- ✅ Logs detalhados de erros
- ✅ Credenciais em variáveis de ambiente

## 📊 Monitoramento

Logs são salvos em:
- `logs/combined.log` - Todos os logs
- `logs/error.log` - Apenas erros

Estrutura de log:
```
2026-02-25 19:00:00 [INFO]: Mensagem recebida de +5511999999999: Olá
2026-02-25 19:00:03 [INFO]: Resposta enviada para +5511999999999
```

## 🐛 Troubleshooting

### Bot não responde mensagens

1. Verifique se Evolution API está conectada: `GET /health`
2. Verifique webhook configurado na Evolution API
3. Verifique logs em `logs/error.log`

### Erro ao agendar

1. Verifique se Google Calendar está autenticado
2. Verifique se `GOOGLE_REFRESH_TOKEN` está no `.env`
3. Tente gerar novo refresh token

### Redis não conecta

1. Verifique host e porta do Redis
2. Verifique senha se necessário
3. Teste conexão: `redis-cli -h HOST -p PORT`

### OpenAI retorna erro

1. Verifique se API Key é válida
2. Verifique se tem créditos na conta
3. Verifique rate limits

## 🚀 Deploy

### Deploy no EasyPanel

1. Crie novo app Node.js
2. Configure variáveis de ambiente
3. Configure Redis (use o Redis do EasyPanel)
4. Deploy do repositório
5. Configure domínio/webhook

### Deploy no Railway/Render

1. Conecte repositório Git
2. Configure variáveis de ambiente
3. Adicione Redis add-on
4. Deploy automático

## 📈 Melhorias Futuras

- [ ] Dashboard de analytics
- [ ] Lembretes automáticos 1 dia antes
- [ ] Suporte a múltiplos dentistas
- [ ] Integração com sistema de pagamento
- [ ] Feedback pós-consulta
- [ ] Multi-idioma (inglês, espanhol)
- [ ] Interface web para gestão

## 📄 Licença

MIT

## 🤝 Suporte

Para dúvidas ou problemas, verifique os logs e a documentação das APIs utilizadas.

---

Desenvolvido com ❤️ para facilitar o agendamento de consultas odontológicas
"# agendamento-dentista" 
