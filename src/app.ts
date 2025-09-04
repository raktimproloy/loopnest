import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import router from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";

const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];
// Parsers
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

// Application Routes
app.use("/api/v1/", router);

app.get("/api/v1/", (req: Request, res: Response) => {
  res.send("Loop Nest API Live Now 1");
});

app.get("/", (req: Request, res: Response) => {
  const name = "Loop Nest server live now";
  res.send(name);
});

// Global error handler (must be after all routes)
app.use(globalErrorHandler);

// Handle 404 routes
app.use(notFound);

export default app;
