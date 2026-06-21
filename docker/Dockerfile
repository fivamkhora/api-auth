FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

ENV NODE_ENV=production
ENV PORT=3000

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000
CMD ["./node_modules/.bin/tsx", "src/server.ts"]
