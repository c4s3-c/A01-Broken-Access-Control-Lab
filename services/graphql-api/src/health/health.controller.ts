import { Response, Request } from 'express';

export function healthController(req: Request, res: Response) {
  res.json({
    status: 'ok',
    service: 'graphql-api',
    timestamp: new Date().toISOString(),
  });
}
