FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm run build

RUN mkdir -p logs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
