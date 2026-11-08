# One Node image for both stages, so native modules (argon2) are built for
# the libc they run on. Pinned by the digest of the multi-platform index;
# the tag is for the reader.
ARG NODE_IMAGE=node:14.21.3-alpine3.17@sha256:434215b487a329c9e867202ff89e704d3a75e554822e07f3e0c0f9e606121b33

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
RUN npm ci --only=production


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
