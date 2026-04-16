import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async listar() {
    const usuarios = await this.prisma.usuario.findMany({
      orderBy: { creadoEn: 'desc' },
    });

    return usuarios.map((u) => this.toUsuarioPublico(u));
  }

  async obtenerPorId(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException({ mensaje: `Usuario ${id} no encontrado.` });
    }

    return this.toUsuarioPublico(usuario);
  }

  async crear(dto: CrearUsuarioDto) {
    const passwordHash = await this.authService.hashPassword(dto.password);

    try {
      const usuario = await this.prisma.usuario.create({
        data: {
          nombre: dto.nombre.trim(),
          email: dto.email.trim().toLowerCase(),
          passwordHash,
          telefono: dto.telefono?.trim() || null,
          empresa: dto.empresa?.trim() || null,
          cargo: dto.cargo?.trim() || null,
          rol: dto.rol ?? RolUsuario.cliente,
        },
      });

      return this.toUsuarioPublico(usuario);
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  async actualizar(id: number, dto: ActualizarUsuarioDto) {
    await this.ensureExiste(id);

    try {
      const usuario = await this.prisma.usuario.update({
        where: { id },
        data: {
          ...(dto.nombre ? { nombre: dto.nombre.trim() } : {}),
          ...(dto.email ? { email: dto.email.trim().toLowerCase() } : {}),
          ...(dto.telefono !== undefined ? { telefono: dto.telefono?.trim() || null } : {}),
          ...(dto.empresa !== undefined ? { empresa: dto.empresa?.trim() || null } : {}),
          ...(dto.cargo !== undefined ? { cargo: dto.cargo?.trim() || null } : {}),
          ...(dto.rol ? { rol: dto.rol } : {}),
          ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
        },
      });

      return this.toUsuarioPublico(usuario);
    } catch (error: unknown) {
      this.handlePrismaError(error);
    }
  }

  async desactivar(id: number) {
    await this.ensureExiste(id);

    const usuario = await this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });

    return this.toUsuarioPublico(usuario);
  }

  async cambiarPassword(id: number, dto: CambiarPasswordDto, actorId: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException({ mensaje: `Usuario ${id} no encontrado.` });
    }

    // Si el actor se cambia su propio password, requiere validar password actual.
    if (actorId === id && dto.passwordActual) {
      const valida = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
      if (!valida) {
        throw new UnauthorizedException({ mensaje: 'La contraseña actual es incorrecta.' });
      }
    }

    const passwordHash = await this.authService.hashPassword(dto.passwordNueva);

    await this.prisma.usuario.update({
      where: { id },
      data: { passwordHash },
    });

    return { mensaje: 'Contraseña actualizada correctamente.' };
  }

  private async ensureExiste(id: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw new NotFoundException({ mensaje: `Usuario ${id} no encontrado.` });
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      throw new BadRequestException({ mensaje: 'Ya existe un usuario con ese correo.' });
    }

    throw new BadRequestException({ mensaje: 'No fue posible procesar la solicitud de usuario.' });
  }

  private toUsuarioPublico(usuario: {
    id: number;
    nombre: string;
    email: string;
    telefono: string | null;
    empresa: string | null;
    cargo: string | null;
    rol: RolUsuario;
    activo: boolean;
    creadoEn: Date;
  }) {
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      telefono: usuario.telefono ?? undefined,
      empresa: usuario.empresa ?? undefined,
      cargo: usuario.cargo ?? undefined,
      rol: usuario.rol,
      activo: usuario.activo,
      fechaRegistro: usuario.creadoEn,
    };
  }
}
