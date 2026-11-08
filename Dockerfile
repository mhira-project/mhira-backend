# One Node image for both stages, so native modules (argon2) are built for
# the libc they run on. Pinned by the digest of the multi-platform index;
# the tag is for the reader.
ARG NODE_IMAGE=node:18.20.8-alpine3.21@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e

### Development container build #####################################
FROM ${NODE_IMAGE} AS builder

# For native modules without a prebuilt binary for the platform (argon2 on arm64).
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build artifacts
RUN npm run build

# Preprare node_modules with only production dependencies
RUN npm ci --omit=dev


### Production container build #####################################
FROM ${NODE_IMAGE} AS production

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
