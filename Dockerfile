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
FROM python3.10-nodejs14-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

RUN pip install pyxform

COPY package*.json ./

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main"]

