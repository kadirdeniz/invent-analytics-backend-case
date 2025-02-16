import { Express } from "express";
import winston from "winston";
import { ConfigService } from "../config/config";

const config = new ConfigService();

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(logColors);

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  levels: logLevels,
  level: config.get("LOG_LEVEL") || "info",
  format: logFormat,
  defaultMeta: {
    environment: config.get("NODE_ENV"),
    service: "library-service",
  },
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (config.isDevelopment()) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export const setupLogging = (app: Express) => {
  app.use((req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const logData = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      };

      const logMessage = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;

      if (res.statusCode >= 500) {
        logger.error(logMessage, logData);
      } else if (res.statusCode >= 400) {
        logger.warn(logMessage, logData);
      } else {
        logger.info(logMessage, logData);
      }
    });

    next();
  });
};

export default logger;
