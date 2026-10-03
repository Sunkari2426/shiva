import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import helmet from "helmet";
import { config } from "./config.js";
import { connectDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import pickupRoutes from "./routes/pickups.js";
import collectorRoutes from "./routes/collector.js";
import addressRoutes from "./routes/addresses.js";
import scrapRoutes from "./routes/scrap.js";
import adminRoutes from "./routes/admin.js";
import notificationRoutes from "./routes/notifications.js";

const app = express();
const server = http.createServer(app);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (origin === config.clientOrigin) return true;
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && url.hostname.endsWith(".app.github.dev");
  } catch {
    return false;
  }
}

const corsOptions = {
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  credentials: true
};

const io = new Server(server, { cors: corsOptions });
app.set("io", io);

const requestWindow = new Map();
function apiRateLimit(limit = 180, windowMs = 60_000) {
  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const recent = (requestWindow.get(key) || []).filter(t => now - t < windowMs);
    if (recent.length >= limit) {
      return res.status(429).json({ message: "Too many requests. Please try again shortly." });
    }
    recent.push(now);
    requestWindow.set(key, recent);
    next();
  };
}
setInterval(() => {
  const cutoff = Date.now() - 60_000;
  for (const [key, values] of requestWindow) {
    const recent = values.filter(t => t > cutoff);
    if (recent.length) requestWindow.set(key, recent);
    else requestWindow.delete(key);
  }
}, 60_000).unref();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use("/api", apiRateLimit());

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "scrap-mama-api",
    database: ["connected", "connecting"].includes(requireMongooseState()) ? "ready" : "unavailable"
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/scrap", scrapRoutes);
app.use("/api/collector", collectorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

io.on("connection", socket => {
  socket.on("pickup:join", pickupId => {
    if (pickupId) socket.join(String(pickupId));
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = Number(err.statusCode || err.status || 500);
  res.status(status >= 400 && status < 600 ? status : 500).json({
    message: status === 500 ? "Internal server error" : err.message
  });
});

function requireMongooseState() {
  // Mongoose readyState: 0 disconnected, 1 connected, 2 connecting, 3 disconnecting.
  return globalThis.__scrapMamaMongoReadyState ?? 0;
}

connectDatabase().then(() => {
  globalThis.__scrapMamaMongoReadyState = 1;
  server.listen(config.port, () => console.log(`Scrap Mama API listening on http://localhost:${config.port}`));
}).catch(err => {
  globalThis.__scrapMamaMongoReadyState = 0;
  console.error("Startup failed", err);
  process.exit(1);
});

export { app, server };
