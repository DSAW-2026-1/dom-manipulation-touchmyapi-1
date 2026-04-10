const path = require("path");

const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const rootDir = path.join(__dirname);

const staticOptions = {
  etag: true,
  fallthrough: false,
  setHeaders(res, filePath) {
    if (filePath.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css; charset=utf-8");
    } else if (filePath.endsWith(".js")) {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    }
  },
};

app.use("/styles", express.static(path.join(rootDir, "styles"), staticOptions));
app.use("/scripts", express.static(path.join(rootDir, "scripts"), staticOptions));

app.use(express.static(rootDir, { index: false }));

app.get("/", (_req, res) => {
  res.type("html").sendFile(path.join(rootDir, "index.html"));
});

app.use((_req, res) => {
  res.status(404).type("text/plain").send("Not found");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor listo en http://0.0.0.0:${PORT}`);
});

