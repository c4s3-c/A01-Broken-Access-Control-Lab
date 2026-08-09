import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// ❌ VULNERABILIDAD INTENCIONAL - NO CORREGIR
// Este decorador extrae el usuario del request.user, que fue inyectado
// por HeaderAuthGuard desde headers HTTP. NO hay validación contra BD.

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
