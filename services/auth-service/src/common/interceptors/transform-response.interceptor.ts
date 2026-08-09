import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept<T>(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const isHealthCheck = request.url === '/health' || request.url.includes('/health');

    return next.handle().pipe(
      map((data) => {
        // Don't transform health check responses or if data is already in correct format
        if (isHealthCheck || (data && typeof data === 'object' && 'success' in data)) {
          return data;
        }

        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
