import express, { Application, Request, Response } from 'express';
import path from "path";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from "swagger-ui-express";
import { envVars } from './app/config/env';
import { notFound } from './app/middlewares/notFound';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import { PaymentControllers } from './app/modules/payment/payment.controller';
import { AppRoutes } from './app/routes';

const app: Application = express();
const openApiPath = path.resolve(process.cwd(), "docs", "openapi.yaml");
const allowedOrigins = envVars.FRONTEND_URLS
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

if (envVars.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), PaymentControllers.handleStripeWebhook);

// parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/docs/openapi.yaml", (req: Request, res: Response) => {
  res.sendFile(openApiPath);
});

app.use(
  "/docs",
  express.static(path.join(process.cwd(), "public", "swagger-ui"), {
    index: false,
  })
);

app.get("/docs", (req: Request, res: Response, next) => {
  if (req.originalUrl === "/docs") {
    res.redirect(301, "/docs/");
    return;
  }

  next();
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerUrl: "/docs/openapi.yaml",
  })
);


app.use('/api/v1', AppRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.send('Server is running!');
});



app.use(globalErrorHandler);
app.use(notFound)

export default app;
