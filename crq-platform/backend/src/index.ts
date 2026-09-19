import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { riskRouter } from "./routes/risk";
import { authRouter } from "./routes/auth";
import { connectorsRouter } from "./routes/connectors";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(pinoHttp());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "crq-backend" }));

app.use("/api/auth", authRouter);
app.use("/api/connectors", connectorsRouter);
app.use("/api/risk", riskRouter);

app.listen(PORT, () => {
  console.log(`CRQ backend listening on :${PORT}`);
});
