# syntax=docker/dockerfile:1
# Muvance API. Build from the repository root:
#   docker build -f apps/api/Dockerfile -t muvance-api .

# ---- build: compile TypeScript (shared package is bundled in)
FROM node:24-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
# --ignore-scripts: no install hooks needed (and skips mongodb-memory-server's download).
RUN npm ci --ignore-scripts --include-workspace-root -w @muvance/api -w @muvance/shared
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build -w @muvance/api

# ---- prod-deps: only runtime dependencies
FROM node:24-alpine AS prod-deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN npm ci --ignore-scripts --omit=dev -w @muvance/api && npm cache clean --force

# ---- runtime
FROM node:24-alpine
ENV NODE_ENV=production \
    PORT=4000
WORKDIR /repo/apps/api
COPY --from=prod-deps --chown=node:node /repo/node_modules /repo/node_modules
COPY --from=build --chown=node:node /repo/apps/api/dist ./dist
COPY --chown=node:node apps/api/package.json ./package.json
# Never run as root.
USER node
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=5 \
  CMD wget -qO- http://127.0.0.1:4000/api/health > /dev/null || exit 1
CMD ["node", "--enable-source-maps", "dist/server.js"]
