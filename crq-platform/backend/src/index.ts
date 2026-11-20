import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { riskRouter } from "./routes/risk";
import { authRouter } from "./routes/auth";
import { connectorsRouter } from "./routes/connectors";
import { cisoRouter } from "./routes/ciso";
import { adminRouter } from "./routes/admin";
import { auditRouter } from "./routes/audit";
import { aiRouter } from "./routes/ai";

const app = express();
const PORT = process.env.PORT ?? 4000;

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile/curl/same-origin rewrites) or matching origins / Vercel deployment
      if (!origin || allowedOrigins.includes(origin) || process.env.VERCEL || process.env.NODE_ENV === "production") {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(pinoHttp());

app.get("/health", (_req, res) => res.json({ status: "ok", service: "crq-backend" }));

// Feature-Wise Modular Endpoints
app.use("/api/auth", authRouter);
app.use("/api/ciso", cisoRouter);
app.use("/api/admin", adminRouter);
app.use("/api/risk", riskRouter);
app.use("/api/connectors", connectorsRouter);
app.use("/api/audit", auditRouter);
app.use("/api/ai", aiRouter);

app.listen(PORT, () => {
  console.log(`CRQ backend listening on :${PORT}`);
});
