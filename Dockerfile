FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build do TypeScript (precisa do tsc que está nas devDependencies)
RUN npm run build

# Remover devDependencies após o build
RUN npm prune --production

# Criar diretório de logs
RUN mkdir -p logs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
