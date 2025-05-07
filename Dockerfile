FROM node:20-alpine AS build-stage

WORKDIR /app

# RUN corepack enable
# RUN corepack prepare pnpm@latest --activate
RUN npm install -g pnpm

# 設定 npm 的 registry
RUN npm config set registry https://registry.npmmirror.com

# 全域安裝 pnpm，取代 corepack 安裝方式
RUN npm install -g pnpm

# 複製必要檔案，若有使用 .npmrc 可保持不變
COPY .npmrc package.json pnpm-lock.yaml .env.staging ./

# 安裝專案相依套件
RUN pnpm install --frozen-lockfile

# 複製其他檔案到容器中
COPY . .

# 建構階段的環境參數（這邊以 ARG 傳入，再設定給 ENV 供 Vite 使用）
ARG BUILD_ENV
ARG VITE_OIDC_AUTHORITY
ARG VITE_OIDC_CLIENT_ID
ARG VITE_OIDC_REDIRECT_URI
ARG VITE_OIDC_LOGOUT_URI
ARG VITE_OIDC_SILENT_REDIRECT_URI
ARG VITE_API_PROXY_TARGET
ARG VITE_PUBLIC_PATH
ARG VITE_PORT

ENV VITE_OIDC_AUTHORITY=${VITE_OIDC_AUTHORITY}
ENV VITE_OIDC_CLIENT_ID=${VITE_OIDC_CLIENT_ID}
ENV VITE_OIDC_REDIRECT_URI=${VITE_OIDC_REDIRECT_URI}
ENV VITE_OIDC_LOGOUT_URI=${VITE_OIDC_LOGOUT_URI}
ENV VITE_OIDC_SILENT_REDIRECT_URI=${VITE_OIDC_SILENT_REDIRECT_URI}
ENV VITE_API_PROXY_TARGET=${VITE_API_PROXY_TARGET}
ENV VITE_PUBLIC_PATH=${VITE_PUBLIC_PATH}
ENV VITE_PORT=${VITE_PORT}

# 執行建構（build）指令
RUN pnpm build --mode ${BUILD_ENV}

# nginx setting
FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
