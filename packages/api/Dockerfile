# Build stage
FROM node:22-slim AS builder

RUN npm install -g pnpm@9

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./

# Copy package.json files for all packages
COPY packages/common/package.json packages/common/
COPY packages/contracts/package.json packages/contracts/
COPY packages/sdk/package.json packages/sdk/
COPY packages/api/package.json packages/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/common/ packages/common/
COPY packages/contracts/ packages/contracts/
COPY packages/sdk/ packages/sdk/
COPY packages/api/ packages/api/

# Build in dependency order
RUN pnpm --filter @eterecitizen/common run build && \
    pnpm --filter @eterecitizen/sdk run build && \
    pnpm --filter @eterecitizen/api run build

# Production stage
FROM node:22-slim AS production

RUN npm install -g pnpm@9

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/common/package.json packages/common/
COPY packages/contracts/package.json packages/contracts/
COPY packages/sdk/package.json packages/sdk/
COPY packages/api/package.json packages/api/

RUN pnpm install --frozen-lockfile --prod

# Copy built output
COPY --from=builder /app/packages/common/dist packages/common/dist
COPY --from=builder /app/packages/sdk/dist packages/sdk/dist
COPY --from=builder /app/packages/api/dist packages/api/dist

# Copy contracts ABI (needed at runtime by SDK)
COPY --from=builder /app/packages/contracts/artifacts packages/contracts/artifacts

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "packages/api/dist/index.js"]
