import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./config.js";
import { connectDatabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import pickupRoutes from "./routes/pickups.js";
import collectorRoutes from "./routes/collector.js";
import addressRoutes from "./routes/addresses.js";
import scrapRoutes from "./routes/scrap.js";
import adminRoutes from "./routes/admin.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: config.clientOrigin, methods: ["GET", "POST"] } });
app.set("io", io);

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "scrap-mama-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/scrap", scrapRoutes);
app.use("/api/collector", collectorRoutes);
app.use("/api/admin", adminRoutes);

io.on("connection", socket => {
  socket.on("pickup:join", pickupId => {
    if (pickupId) socket.join(String(pickupId));
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

connectDatabase().then(() => {
  server.listen(config.port, () => console.log(`Scrap Mama API listening on http://localhost:${config.port}`));
}).catch(err => {
  console.error("Startup failed", err);
  process.exit(1);
});
