# syntax=docker/dockerfile:1
# Static React apps (website and admin), served by nginx. Build from the repository root:
#   docker build -f docker/spa.Dockerfile --build-arg APP=web   -t muvance-web .
#   docker build -f docker/spa.Dockerfile --build-arg APP=admin -t muvance-admin .
ARG APP=web

FROM node:24-alpine AS build
ARG APP
WORKDIR /repo
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/${APP}/package.json apps/${APP}/
COPY packages/shared/package.json packages/shared/
RUN npm ci --ignore-scripts --include-workspace-root -w @muvance/${APP} -w @muvance/shared
COPY packages/shared packages/shared
COPY apps/${APP} apps/${APP}
RUN npm run build -w @muvance/${APP}

FROM nginx:1.29-alpine
ARG APP
COPY docker/nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/${APP}/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1/healthz > /dev/null || exit 1
