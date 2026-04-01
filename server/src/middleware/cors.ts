import cors from "cors";
import { config } from "../config.js";

export const corsMiddleware = cors({
  origin: config.cloudUrl || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "X-Server-Key", "X-Server-Id", "X-Upload-Token", "Range"],
  exposedHeaders: ["Content-Range", "Accept-Ranges", "Content-Length"],
});
