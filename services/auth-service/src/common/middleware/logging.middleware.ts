import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, headers } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      const logEntry = {
        timestamp: new Date().toISOString(),
        method,
        url: originalUrl,
        statusCode,
        durationMs: duration,
        userAgent: headers['user-agent'],
        ip: req.ip || req.socket.remoteAddress,
      };

      // In production, this would go to a logging service
      // For now, we log to console in JSON format
      if (process.env.LOG_FORMAT === 'json') {
        console.log(JSON.stringify(logEntry));
      } else {
        console.log(
          `[${logEntry.timestamp}] ${method} ${originalUrl} ${statusCode} - ${durationMs}ms`,
        );
      }
    });

    next();
  }
}
