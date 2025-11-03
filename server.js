import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = process.env.PORT || 10000;

const target = "http://186.29.40.51:8000/stream";

app.use("/", createProxyMiddleware({
  target,
  changeOrigin: true,
  ws: true,
  secure: false,
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader("User-Agent", "RadioConectaProxy/1.0");
    proxyReq.setHeader("Icy-MetaData", "1");
  },
  onProxyRes: (proxyRes) => {
    delete proxyRes.headers["transfer-encoding"];
    proxyRes.headers["content-type"] = "audio/mpeg";
    proxyRes.headers["cache-control"] = "no-cache";
  },
  selfHandleResponse: false,
  logLevel: "debug",
}));

app.listen(PORT, () => {
  console.log(`🎧 Proxy HTTPS activo en puerto ${PORT}`);
});
