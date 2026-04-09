import winston from "winston";

export const createWinstonLogger = (options: winston.LoggerOptions): winston.Logger =>
    winston.createLogger(options);
