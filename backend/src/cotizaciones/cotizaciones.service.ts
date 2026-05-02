import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoCotizacion, Prisma, RolUsuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearCotizacionDto } from './dto/crear-cotizacion.dto';

@Injectable()
export class CotizacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(usuarioId: number, dto: CrearCotizacionDto) {
    const productoIds = [...new Set(dto.items.map((item) => item.productoId))];
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds }, activo: true },
      select: { id: true },
    });

    if (productos.length !== productoIds.length) {
      throw new BadRequestException('Uno o más productos no existen o están inactivos.');
    }

    const descuentoPct = dto.descuentoPct ?? 0;
    const margenPct = dto.margenPct ?? 0;

    if (descuentoPct > 100) {
      throw new BadRequestException('El descuento no puede ser mayor a 100%.');
    }

    const subtotal = dto.items.reduce((acc, item) => {
      return acc + item.cantidad * item.precioUnitario;
    }, 0);

    const totalConDescuento = subtotal - subtotal * (descuentoPct / 100);
    const total = totalConDescuento + totalConDescuento * (margenPct / 100);

    return this.prisma.$transaction(async (tx) => {
      const numero = await this.generarNumeroCotizacion(tx);

      const cotizacion = await tx.cotizacion.create({
        data: {
          numero,
          usuarioId,
          subtotal,
          descuentoPct,
          margenPct,
          total,
          observaciones: dto.observaciones?.trim() || null,
          contactoNombre: dto.contactoNombre?.trim() || null,
          contactoCorreo: dto.contactoCorreo?.trim().toLowerCase() || null,
          contactoTelefono: dto.contactoTelefono?.trim() || null,
          contactoCargo: dto.contactoCargo?.trim() || null,
          contactoEmpresa: dto.contactoEmpresa?.trim() || null,
          proyectoNombre: dto.proyectoNombre?.trim() || null,
          fechaRequerida: dto.fechaRequerida ? new Date(dto.fechaRequerida) : null,
          items: {
            create: dto.items.map((item) => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              subtotal: item.cantidad * item.precioUnitario,
            })),
          },
        },
        include: {
          items: {
            include: { producto: true },
          },
        },
      });

      return cotizacion;
    });
  }

  async listarPropias(usuarioId: number) {
    return this.prisma.cotizacion.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: 'desc' },
      include: {
        items: {
          include: { producto: true },
        },
      },
    });
  }

  async listarTodas() {
    return this.prisma.cotizacion.findMany({
      orderBy: { creadoEn: 'desc' },
      include: {
        usuario: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
        items: {
          include: { producto: true },
        },
      },
    });
  }

  async obtenerPorId(id: number, usuarioId: number, rol: RolUsuario) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
        items: {
          include: { producto: true },
        },
      },
    });

    if (!cotizacion) {
      throw new NotFoundException(`Cotización ${id} no encontrada.`);
    }

    if (rol !== RolUsuario.admin && cotizacion.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para consultar esta cotización.');
    }

    return cotizacion;
  }

  async actualizarEstado(id: number, estado: EstadoCotizacion, usuarioId: number, rol: RolUsuario) {
    const cotizacion = await this.prisma.cotizacion.findUnique({ where: { id } });
    if (!cotizacion) {
      throw new NotFoundException(`Cotización ${id} no encontrada.`);
    }

    const esAdmin = rol === RolUsuario.admin;
    const esPropietario = cotizacion.usuarioId === usuarioId;
    if (!esAdmin && !esPropietario) {
      throw new ForbiddenException('No tienes permiso para modificar esta cotización.');
    }

    if (!esAdmin && estado !== EstadoCotizacion.enviada && estado !== EstadoCotizacion.cancelada) {
      throw new ForbiddenException('Solo un admin puede aceptar o rechazar cotizaciones.');
    }

    return this.prisma.cotizacion.update({
      where: { id },
      data: {
        estado,
        ...(estado === EstadoCotizacion.enviada ? { enviadoEn: new Date() } : {}),
      },
    });
  }

  private async generarNumeroCotizacion(tx: Prisma.TransactionClient): Promise<string> {
    const anio = new Date().getFullYear();
    const inicioAnio = new Date(`${anio}-01-01T00:00:00.000Z`);

    const count = await tx.cotizacion.count({
      where: {
        creadoEn: {
          gte: inicioAnio,
        },
      },
    });

    const consecutivo = String(count + 1).padStart(4, '0');
    return `COT-${anio}-${consecutivo}`;
  }
}
