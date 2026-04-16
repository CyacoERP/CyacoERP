import { RolUsuario } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: RolUsuario;
}

export interface UsuarioAutenticado {
  id: number;
  email: string;
  rol: RolUsuario;
}
