import winston from 'winston';
import config from './config.js';

const { combine, timestamp, printf, colorize, align } = winston.format;

const logger = winston.createLogger({
  level: config.server.env === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    colorize({ all: true }),
    align(),
    printf(
      (info) =>
        `[${info.timestamp}] ${info.level}: ${info.message}${
          info.stack ? '\n' + info.stack : ''
        }`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
  exitOnError: false,
});

// Create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function (message) {
    logger.info(message.trim());
  },
};

export default logger;
