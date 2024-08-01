import { type Server, type IncomingMessage, type ServerResponse } from "http";

import mongoose from "mongoose";

import app from "./app.js";
import config from "./config.js";
import logger from "./logger.js";

if (config.env === "development") {
  mongoose.set("debug", true);
}

let server: Server<typeof IncomingMessage, typeof ServerResponse>;
mongoose
  .connect(config.mongoose.url)
  .then(() => {
    server = app.listen(config.port, () => {
      logger.info(`Listening to port ${config.port}`);
    });
  })
  .catch(logger.error);

const unexpectedErrorHandler = (err: Error): void => {
  logger.error(err);
  process.exit(1);
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

const signalHandler = (signal: string): void => {
  logger.error(signal);
  server.close(() => {
    logger.info("Server closed");
    process.kill(process.pid, signal);
  });
  setTimeout(() => {
    process.kill(process.pid, signal);
  }, 10000).unref();
};

process.on("SIGINT", signalHandler);
process.on("SIGTERM", signalHandler);
