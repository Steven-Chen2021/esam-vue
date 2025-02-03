FROM node:20-alpine AS build-stage

WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN npm config set registry https://registry.npmmirror.com

COPY .npmrc package.json pnpm-lock.yaml .env.staging ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG BUILD_ENV
# 新增接收並導出代理 target 的變數
ARG VITE_API_PROXY_TARGET
ENV VITE_API_PROXY_TARGET=${VITE_API_PROXY_TARGET}

RUN pnpm build --mode ${BUILD_ENV}

FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]