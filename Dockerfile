### Development container build #####################################
FROM node:latest AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=development

COPY . .

RUN npm run build


### Production container build #####################################
FROM node:alpine

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main"]

