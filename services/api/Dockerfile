FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY services/api/package*.json ./services/api/

RUN npm install

COPY services/api ./services/api
COPY tsconfig.json ./

WORKDIR /app/services/api

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
