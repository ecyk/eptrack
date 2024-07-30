import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import passport from "passport";
import pinoHttp from "pino-http";

import jwtStrategy from "./api/v1/auth/auth-strategy";
import routes from "./api/v1/routes";
import connectDB from "./db";
import { notFoundHandler, errorHandler } from "./handlers";
import logger from "./logger";
import { env } from "./vars";

connectDB();

export const app = express();

app.set("trust proxy", true);

if (env === "development") {
  app.use(pinoHttp({ logger }));
}
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors());
app.options("*", cors());

app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);
