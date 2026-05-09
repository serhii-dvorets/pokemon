FROM --platform=linux/amd64 node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM --platform=linux/amd64 node:18-alpine

WORKDIR /app

COPY --from=builder ./app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env.defaults ./
COPY --from=builder /app/dist ./dist

CMD [ "npm", "run", "start:dev" ]