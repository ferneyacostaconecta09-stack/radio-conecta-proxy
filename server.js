import express from "express";
import { Readable } from "stream";

const app = express();
const PORT = process.env.PORT || 10000;
const RADIO_URL = "http://186.29.40.51:8000/stream";

// 🔹 Middleware para permitir CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // o solo tu dominio: "https://radioconecta.page.gd"
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Range, Accept, Origin, User-Agent");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get("/", async (req, res) => {
  console.log("🎧 Nueva conexión al proxy desde", req.headers.origin || "local");

  try {
    const response = await fetch(RADIO_URL, {
      headers: {
        "Icy-MetaData": "1",
        "User-Agent": "RadioConectaProxy/3.0"
      }
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream inválido: ${response.status} ${response.statusText}`);
    }

    // Convertir el stream web a Node.js
    const nodeStream = Readable.fromWeb(response.body);

    res.writeHead(200, {
      "Content-Type": response.headers.get("content-type") || "audio/mpeg",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
      "Accept-Ranges": "bytes"
    });

    nodeStream.pipe(res);

    nodeStream.on("error", (err) => {
      console.error("❌ Error en el stream:", err);
      res.end();
    });
  } catch (err) {
    console.error("❌ Error al conectar con la emisora:", err);
    if (!res.headersSent)
      res.status(500).send("Error al conectar con la emisora.");
  }
});

app.listen(PORT, () => {
  console.log(`🎧 Proxy activo en Render (puerto ${PORT})`);
});
