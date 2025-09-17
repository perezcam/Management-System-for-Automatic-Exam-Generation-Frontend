FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

COPY . .

# Build the application
RUN npm run build


FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

CMD ["npm", "run", "dev"]
