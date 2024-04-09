import { createLogger, transports } from 'winston';
import { BaseError } from './app-errors.js';

const logErrors = createLogger({
  transports: [new transports.Console(), new transports.File({ filename: 'app_error.log' })],
});

class ErrorLogger {
  constructor() {}

  async logError(err) {
    console.log('==================== Start Error Logger ===============');
    logErrors.log({
      private: true,
      level: 'error',
      message: `${new Date()}-${JSON.stringify(err)}`,
    });
    console.log('==================== End Error Logger ===============');
    return false;
  }

  isTrustError(error) {
    return error instanceof BaseError && error.isOperational;
  }
}

const errorHandler = async (err, req, res, next) => {
  const errorLogger = new ErrorLogger();

  process.on('uncaughtException', (error) => {
    errorLogger.logError(error);
    if (errorLogger.isTrustError(err)) {
      // Process needs to be restarted
    }
  });

  if (err) {
    await errorLogger.logError(err);
    if (errorLogger.isTrustError(err)) {
      if (err.errorStack) {
        const errorDescription = err.errorStack;
        return res.status(err.statusCode).json({ message: errorDescription });
      }
      return res.status(err.statusCode).json({ message: err.message });
    }
    // Process needs to be restarted

    return res.status(err.statusCode).json({ message: err.message });
  }
  next();
};

export default errorHandler;
