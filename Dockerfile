FROM node:20-alpine as build-stage

WORKDIR /app
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

RUN npm config set registry https://registry.npmmirror.com

COPY .npmrc package.json pnpm-lock.yaml .env.staging ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_OIDC_AUTHORITY
ARG VITE_OIDC_CLIENT_ID
ARG VITE_OIDC_REDIRECT_URI
ARG VITE_OIDC_LOGOUT_URI
ARG VITE_OIDC_SILENT_REDIRECT_URI

ENV VITE_OIDC_AUTHORITY=$VITE_OIDC_AUTHORITY
ENV VITE_OIDC_CLIENT_ID=$VITE_OIDC_CLIENT_ID
ENV VITE_OIDC_REDIRECT_URI=$VITE_OIDC_REDIRECT_URI
ENV VITE_OIDC_LOGOUT_URI=$VITE_OIDC_LOGOUT_URI
ENV VITE_OIDC_SILENT_REDIRECT_URI=$VITE_OIDC_SILENT_REDIRECT_URI

RUN pnpm build --mode staging

FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]