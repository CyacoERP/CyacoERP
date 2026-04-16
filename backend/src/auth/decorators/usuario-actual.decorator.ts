import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioAutenticado } from '../interfaces';

export const UsuarioActual = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UsuarioAutenticado | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: UsuarioAutenticado }>();
    return request.user;
  },
);
