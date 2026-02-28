# 📅 Guia Completo: Configurar Google Calendar API

## Passo 1: Criar Projeto no Google Cloud

1. **Acesse**: https://console.cloud.google.com
2. **Clique** no seletor de projetos (topo da página)
3. **Clique em "NOVO PROJETO"**
4. **Preencha**:
   - Nome do projeto: `Dentista Bot`
   - Organização: (deixe como está)
5. **Clique em "CRIAR"**
6. **Aguarde** alguns segundos até o projeto ser criado
7. **Selecione** o projeto criado no seletor de projetos

## Passo 2: Ativar Google Calendar API

1. **No menu lateral**, clique em **"APIs e serviços"** > **"Biblioteca"**
2. **Pesquise** por: `Google Calendar API`
3. **Clique** no resultado "Google Calendar API"
4. **Clique em "ATIVAR"**
5. **Aguarde** a ativação (uns segundos)

## Passo 3: Configurar Tela de Consentimento OAuth

1. **No menu lateral**, vá em **"APIs e serviços"** > **"Tela de consentimento OAuth"**
2. **Selecione** "Externo" (a menos que tenha Google Workspace)
3. **Clique em "CRIAR"**
4. **Preencha o formulário**:
   - **Nome do app**: `Dentista Bot`
   - **E-mail de suporte do usuário**: Seu email
   - **Domínio do aplicativo**: (deixe em branco)
   - **E-mail do desenvolvedor**: Seu email
5. **Clique em "SALVAR E CONTINUAR"**
6. **Escopos**: Clique em "ADICIONAR OU REMOVER ESCOPOS"
   - Pesquise: `calendar`
   - Marque: `https://www.googleapis.com/auth/calendar`
   - **Clique em "ATUALIZAR"**
7. **Clique em "SALVAR E CONTINUAR"**
8. **Usuários de teste**: Clique em "ADD USERS"
   - Adicione seu email (o mesmo da conta Google Calendar que vai usar)
   - **Clique em "ADICIONAR"**
9. **Clique em "SALVAR E CONTINUAR"**
10. **Clique em "VOLTAR PARA O PAINEL"**

## Passo 4: Criar Credenciais OAuth 2.0

1. **No menu lateral**, vá em **"APIs e serviços"** > **"Credenciais"**
2. **Clique em "CRIAR CREDENCIAIS"** > **"ID do cliente OAuth"**
3. **Tipo de aplicativo**: Selecione **"Aplicativo da Web"**
4. **Preencha**:
   - **Nome**: `Dentista Bot Client`
   - **URIs de redirecionamento autorizados**: Clique em "ADICIONAR URI"
     - Adicione: `http://localhost:3000/oauth2callback`
5. **Clique em "CRIAR"**
6. **IMPORTANTE**: Uma janela aparecerá com:
   - **ID do cliente**: Copie e guarde
   - **Chave secreta do cliente**: Copie e guarde
7. **Clique em "OK"**

## Passo 5: Adicionar Credenciais no .env

Edite seu arquivo `.env` e adicione:

```env
# Google Calendar
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_CALENDAR_ID=primary
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_REFRESH_TOKEN=
```

**Substitua**:
- `GOOGLE_CLIENT_ID`: Cole o ID do cliente que copiou
- `GOOGLE_CLIENT_SECRET`: Cole a chave secreta que copiou

## Passo 6: Obter o Refresh Token

1. **Certifique-se** de que o bot NÃO está rodando (porta 3000 livre)

2. **Execute o script de autenticação**:
```bash
npm run auth:google
```

3. **O script mostrará**:
   - Uma URL longa começando com `https://accounts.google.com/o/oauth2/v2/auth...`

4. **Copie a URL** e **cole no navegador**

5. **Faça login** com a conta Google que tem o calendário que você quer usar

6. **Você verá uma tela de aviso** dizendo que o app não é verificado:
   - Clique em **"Avançado"**
   - Clique em **"Ir para Dentista Bot (não seguro)"**

7. **Autorize** o acesso ao Google Calendar:
   - Marque a caixa de seleção
   - Clique em **"Continuar"**

8. **Você será redirecionado** para uma página de erro (normal!):
   - A URL será algo como: `http://localhost:3000/oauth2callback?code=4/0AanRRrtkZ...`

9. **Copie APENAS o código** (tudo depois de `code=` até o `&` ou final da URL):
   - Exemplo: `4/0AanRRrtkZuP8xY...`

10. **Cole o código** no terminal onde está o script

11. **O script mostrará**:
```
✅ Refresh Token obtido. Adicione ao .env:
GOOGLE_REFRESH_TOKEN=1//0gXXXXXXXXXXX
```

12. **Copie o Refresh Token** e **adicione no seu .env**:
```env
GOOGLE_REFRESH_TOKEN=1//0gXXXXXXXXXXX
```

## Passo 7: Testar

1. **Inicie o bot**:
```bash
npm run dev
```

2. **Acesse** o health check:
```bash
curl http://localhost:3000/health
```

3. **Teste via WhatsApp**:
   - "Quero agendar uma consulta"
   - O bot deve verificar disponibilidade no Google Calendar

## ✅ Verificação

Seu `.env` deve estar assim:

```env
# Evolution API
EVOLUTION_API_URL=https://sua-url.com
EVOLUTION_API_KEY=sua-key
EVOLUTION_INSTANCE_NAME=sua-instance

# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo

# Google Calendar
GOOGLE_CLIENT_ID=123456789-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_CALENDAR_ID=primary
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
GOOGLE_REFRESH_TOKEN=1//0gXXXXXXXXXXXXXXX

# Redis
REDIS_HOST=seu-host
REDIS_PORT=6379
REDIS_PASSWORD=sua-senha

# Servidor
PORT=3000
NODE_ENV=development

# Clínica
CLINIC_NAME=Sua Clínica
CLINIC_ADDRESS=Seu Endereço
CLINIC_PHONE=+55 11 99999-9999
CLINIC_BUSINESS_HOURS_START=08:00
CLINIC_BUSINESS_HOURS_END=18:00
CLINIC_APPOINTMENT_DURATION=30
```

## 🔴 Problemas Comuns

### Erro: "redirect_uri_mismatch"
- Certifique-se que adicionou `http://localhost:3000/oauth2callback` nas URIs autorizadas
- Use EXATAMENTE `http://` (não `https://`)

### Erro: "invalid_grant"
- O Refresh Token expirou (acontece após 7 dias se app não verificado)
- Gere um novo Refresh Token seguindo o Passo 6 novamente

### Erro: "Access blocked"
- Adicione seu email em "Usuários de teste" na Tela de Consentimento OAuth

### Token expira muito rápido
- Apps não verificados têm limite de 7 dias
- Para produção, você precisará verificar o app no Google Cloud

---

**Pronto!** Seu bot agora pode criar, listar e cancelar eventos no Google Calendar! 🎉
