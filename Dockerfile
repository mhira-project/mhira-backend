### Development container build #####################################
FROM node:14 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install argon2 --ignore-scripts
RUN npx node-pre-gyp rebuild -C ./node_modules/argon2

RUN npm ci

COPY . .

# Build artifacts
RUN npm run build

# Preprare node_modules with only production dependencies
RUN npm ci --only=production


### Production container build #####################################
FROM node:14-alpine AS production

RUN apk add --no-cache bash

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

COPY wait-for-it.sh ./
COPY start.sh ./
RUN chmod +x wait-for-it.sh
RUN chmod +x start.sh

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main"]
