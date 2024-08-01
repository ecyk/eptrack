import compression from "compression";
import cors from "cors";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import helmet from "helmet";
import status from "http-status";
import { pinoHttp } from "pino-http";

import routes from "./api/v1/routes.js";
import { AppError } from "./app-error.js";
import config from "./config.js";
import { errorConverter, errorHandler } from "./error-handlers.js";
import logger from "./logger.js";

const app = express();

app.set("trust proxy", true);

if (config.env === "development") {
  app.use(pinoHttp({ logger }));
}
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());
app.options("*", cors());

app.use("/api/v1", routes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(status.NOT_FOUND, status[status.NOT_FOUND]));
});
app.use(errorConverter);
app.use(errorHandler);

export default app;
