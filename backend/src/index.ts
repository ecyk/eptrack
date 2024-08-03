import { createClient, RedisModules } from "redis";
import { RedisClientType } from "@redis/client";
import mongoose from "mongoose";

import app from "./app.js";
import config from "./config.js";
import logger from "./logger.js";

async function init() {
  const redisClient = createClient({
    url: config.redis.url,
  });
  redisClient.on("error", (err) => {
    logger.error(err);
    process.exit(1);
  });
  await redisClient.connect();

  await mongoose.connect(config.mongoose.url);

  return redisClient;
}

export const redisClient = await init().catch((err) => {
  logger.error(err);
  process.exit(1);
});

const server = app.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`);
});

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
