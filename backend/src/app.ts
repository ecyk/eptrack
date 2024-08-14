import compression from "compression";
import cors from "cors";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import status from "http-status";
import { pinoHttp } from "pino-http";

import { authorize } from "./api/v1/auth/auth-middlewares.js";
import routes from "./api/v1/routes.js";
import { AppError } from "./app-error.js";
import config from "./config.js";
import { errorConverter, errorHandler } from "./error-handlers.js";
import logger from "./logger.js";

const app = express();

app.set("trust proxy", 1);

if (config.env === "development") {
  app.use(pinoHttp({ logger }));
}
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "https: data:"],
      },
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(compression());
app.use(cors());
app.options("*", cors());

app.use(authorize);

if (config.env === "production") {
  app.use(
    "/api/v1/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 15,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    })
  );
}

app.use("/api/v1", routes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(status.NOT_FOUND, status[status.NOT_FOUND]));
});
app.use(errorConverter);
app.use(errorHandler);

export default app;
