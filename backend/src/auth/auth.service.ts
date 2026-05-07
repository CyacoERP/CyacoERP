import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RolUsuario } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.ensureAdminSeed();
  }

  async registro(dto: RegistroDto) {
    const email = dto.correo.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const usuario = await this.prisma.usuario.create({
        data: {
          nombre: dto.nombreCompleto.trim(),
          email,
          passwordHash,
          telefono: dto.telefono?.trim() || null,
          empresa: dto.empresa?.trim() || null,
          cargo: dto.cargo?.trim() || null,
          rol: RolUsuario.cliente,
        },
      });

      return this.buildAuthResponse(usuario);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        throw new BadRequestException({ mensaje: 'Ya existe una cuenta con ese correo.' });
      }
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException({ mensaje: 'Credenciales inválidas.' });
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException({ mensaje: 'Credenciales inválidas.' });
    }

    return this.buildAuthResponse(usuario);
  }

  async perfil(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException({ mensaje: 'Usuario no autorizado.' });
    }

    return this.toUsuarioPublico(usuario);
  }

  async actualizarPerfil(usuarioId: number, dto: ActualizarPerfilDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException({ mensaje: 'Usuario no autorizado.' });
    }

    const actualizado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ...(dto.nombre !== undefined && { nombre: dto.nombre.trim() }),
        ...(dto.telefono !== undefined && { telefono: dto.telefono.trim() || null }),
        ...(dto.empresa !== undefined && { empresa: dto.empresa.trim() || null }),
        ...(dto.cargo !== undefined && { cargo: dto.cargo.trim() || null }),
      },
    });

    return this.toUsuarioPublico(actualizado);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private buildAuthResponse(usuario: {
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
    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };

    return {
      token: this.jwtService.sign(payload),
      usuario: this.toUsuarioPublico(usuario),
    };
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

  private async ensureAdminSeed(): Promise<void> {
    const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@cyaco.local').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin12345';

    const existente = await this.prisma.usuario.findUnique({ where: { email: adminEmail } });
    if (existente) {
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await this.prisma.usuario.create({
      data: {
        nombre: 'Administrador CYACO',
        email: adminEmail,
        passwordHash,
        rol: RolUsuario.admin,
        activo: true,
      },
    });
  }
}
