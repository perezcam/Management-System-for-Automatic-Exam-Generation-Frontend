FROM node:20-alpine

WORKDIR /app

# Copiamos manifiestos y instalamos deps en build (rápido y reproducible)
COPY package*.json ./
RUN npm ci

# Copiamos el resto del código
COPY . .

ENV HOST=0.0.0.0
EXPOSE 3000

CMD ["npm", "run", "dev"]
