FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN rm -rf tests

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app /app

RUN npm ci --only=production && npm cache clean --force

EXPOSE 3000

USER node

CMD ["node", "src/server.js"]
