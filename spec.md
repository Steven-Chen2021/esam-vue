# 環境專案規格

本文件說明專案所使用的各式環境設定檔與主要環境變數。

## 環境檔案

專案根目錄提供多份 `.env` 系列檔案，可依據建置模式載入：

- `.env`：預設環境設定，亦可做為其他環境的基礎。
- `.env.development`：開發環境專用設定。
- `.env.staging`：測試或驗收環境設定。
- `.env.production`：正式環境設定。

## 主要變數

| 變數名稱 | 說明 |
| -------- | ------------------------------------------------------------ |
| `VITE_PORT` | 本地開發伺服器的埠號 |
| `VITE_HIDE_HOME` | 是否隱藏首頁，`true` 代表隱藏 |
| `VITE_PUBLIC_PATH` | 應用部署的根路徑 |
| `VITE_ROUTER_HISTORY` | 路由模式，可為 `hash` 或 `h5` |
| `VITE_CDN` | 打包時是否使用 CDN 取代本地依賴 |
| `VITE_COMPRESSION` | 壓縮方式，`gzip`、`brotli`、`both` 或 `none` |
| `VITE_OIDC_AUTHORITY` | OIDC 授權伺服器位置 |
| `VITE_OIDC_CLIENT_ID` | OIDC Client ID |
| `VITE_OIDC_REDIRECT_URI` | OIDC 登入完成後導向的網址 |
| `VITE_OIDC_LOGOUT_URI` / `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` | 登出後回呼網址 |
| `VITE_OIDC_SILENT_REDIRECT_URI` | 靜默續期的回呼網址 |
| `VITE_API_PROXY_TARGET` | 代理 API 的後端位址 |

## Docker 建置

`Dockerfile` 允許透過 `ARG` 傳入以上變數，建置階段會寫入 `ENV` 供 Vite 使用，並以 `pnpm build --mode` 產生對應環境的產物。

