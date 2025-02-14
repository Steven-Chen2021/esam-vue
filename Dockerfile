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
ARG VITE_OIDC_AUTHORITY
ARG VITE_OIDC_CLIENT_ID
ARG VITE_OIDC_REDIRECT_URI
ARG VITE_OIDC_LOGOUT_URI
ARG VITE_OIDC_SILENT_REDIRECT_URI
ARG VITE_API_PROXY_TARGET
ARG VITE_PUBLIC_PATH
ARG VITE_PORT

# 設定環境變數，供 Vite 讀取
ENV VITE_OIDC_AUTHORITY=${VITE_OIDC_AUTHORITY}
ENV VITE_OIDC_CLIENT_ID=${VITE_OIDC_CLIENT_ID}
ENV VITE_OIDC_REDIRECT_URI=${VITE_OIDC_REDIRECT_URI}
ENV VITE_OIDC_LOGOUT_URI=${VITE_OIDC_LOGOUT_URI}
ENV VITE_OIDC_SILENT_REDIRECT_URI=${VITE_OIDC_SILENT_REDIRECT_URI}
ENV VITE_API_PROXY_TARGET=${VITE_API_PROXY_TARGET}
ENV VITE_PUBLIC_PATH=${VITE_PUBLIC_PATH}
ENV VITE_PORT=${VITE_PORT}

RUN pnpm build --mode ${BUILD_ENV}

FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]