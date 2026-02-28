# 🚀 Guia de Deploy

## Deploy no EasyPanel

### 1. Preparar Aplicação

1. Commit o código no Git
2. Push para GitHub/GitLab

### 2. Criar App no EasyPanel

1. Acesse seu painel EasyPanel
2. Clique em **Create App** → **Node.js**
3. Conecte seu repositório Git
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: 3000

### 3. Configurar Redis no EasyPanel

1. No EasyPanel, crie um serviço **Redis**
2. Anote as credenciais:
   - Host
   - Port
   - Password

### 4. Configurar Variáveis de Ambiente

No EasyPanel, adicione todas as variáveis do `.env`:

```env
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave
EVOLUTION_INSTANCE_NAME=dentista-bot

OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALENDAR_ID=primary
GOOGLE_REDIRECT_URI=https://seu-dominio.com/oauth2callback
GOOGLE_REFRESH_TOKEN=...

REDIS_HOST=redis-service-easypanel
REDIS_PORT=6379
REDIS_PASSWORD=senha-do-redis
REDIS_DB=0

PORT=3000
NODE_ENV=production

CLINIC_NAME=Sua Clínica
CLINIC_ADDRESS=Seu Endereço
CLINIC_PHONE=+55 11 99999-9999
CLINIC_BUSINESS_HOURS_START=08:00
CLINIC_BUSINESS_HOURS_END=18:00
CLINIC_APPOINTMENT_DURATION=30

CONTEXT_TTL=604800
```

### 5. Deploy

1. Clique em **Deploy**
2. Aguarde o build e deploy
3. Anote a URL do app: `https://seu-app.easypanel.app`

### 6. Configurar Webhook

Na Evolution API, configure o webhook para:
```
https://seu-app.easypanel.app/webhook/evolution
```

### 7. Testar

Acesse: `https://seu-app.easypanel.app/health`

---

## Deploy no Railway

### 1. Instalar Railway CLI (opcional)

```bash
npm install -g @railway/cli
railway login
```

### 2. Deploy via GitHub

1. Acesse [railway.app](https://railway.app)
2. Clique em **New Project**
3. Selecione **Deploy from GitHub repo**
4. Escolha o repositório
5. Railway detecta automaticamente Node.js

### 3. Adicionar Redis

1. No projeto, clique em **New**
2. Escolha **Database** → **Redis**
3. Railway criará automaticamente e conectará

### 4. Configurar Variáveis

No Railway, vá em **Variables** e adicione todas do `.env`

Railway já fornece automaticamente:
- `REDIS_URL` (se usar o Redis do Railway)

### 5. Deploy

- Commit e push para main → Railway deploya automaticamente
- Ou use CLI: `railway up`

---

## Deploy no Render

### 1. Criar Web Service

1. Acesse [render.com](https://render.com)
2. **New** → **Web Service**
3. Conecte repositório GitHub
4. Configure:
   - **Name**: dentista-bot
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2. Adicionar Redis

1. **New** → **Redis**
2. Escolha plano (Free ou pago)
3. Copie a **Internal Redis URL**

### 3. Environment Variables

Adicione no Render todas as variáveis do `.env`

Para Redis, use:
```env
REDIS_HOST=redis-internal-url.render.com
REDIS_PORT=6379
REDIS_PASSWORD=senha-gerada
```

### 4. Deploy

- Render deploya automaticamente no push
- Webhook URL: `https://seu-app.onrender.com/webhook/evolution`

---

## Deploy no Heroku

### 1. Criar App

```bash
heroku create dentista-bot
```

### 2. Adicionar Redis

```bash
heroku addons:create heroku-redis:mini
```

### 3. Configurar Variáveis

```bash
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set EVOLUTION_API_URL=https://...
# ... todas as outras variáveis
```

### 4. Deploy

```bash
git push heroku main
```

### 5. Verificar

```bash
heroku logs --tail
heroku open
```

---

## Deploy com Docker

### 1. Criar Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Criar docker-compose.yml

```yaml
version: '3.8'

services:
  bot:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

### 3. Build e Run

```bash
docker-compose up -d
```

---

## Checklist Pós-Deploy

- [ ] App está rodando (`/health` retorna OK)
- [ ] Redis conectado
- [ ] Evolution API webhook configurado
- [ ] OpenAI respondendo
- [ ] Google Calendar funcionando
- [ ] Teste completo de agendamento
- [ ] Teste de cancelamento
- [ ] Logs sendo gerados
- [ ] Monitoramento configurado

---

## Monitoramento

### Logs

**EasyPanel/Railway/Render**: Interface web

**Heroku**:
```bash
heroku logs --tail
```

**Docker**:
```bash
docker-compose logs -f bot
```

### Métricas Importantes

- Taxa de resposta do bot
- Erros da OpenAI
- Latência do Redis
- Agendamentos criados/dia
- Cancelamentos/dia

### Alertas Recomendados

- Bot offline > 5 minutos
- Taxa de erro > 10%
- Redis desconectado
- OpenAI rate limit

---

## Backup

### Redis (Contextos)

**Backup automático** (cron):
```bash
redis-cli --rdb /backup/dump.rdb
```

**Restaurar**:
```bash
redis-cli --rdb /backup/dump.rdb
```

### Logs

Rotacionar logs grandes:
```bash
find logs/ -name "*.log" -mtime +30 -delete
```

---

## Custos Estimados por Plataforma

| Plataforma | Custo Mensal |
|------------|--------------|
| EasyPanel  | R$ 0-30      |
| Railway    | R$ 20-50     |
| Render     | R$ 0-35      |
| Heroku     | R$ 30-50     |

*Não inclui custos de APIs externas (OpenAI, Evolution)*

---

**Pronto para produção!** 🎉
