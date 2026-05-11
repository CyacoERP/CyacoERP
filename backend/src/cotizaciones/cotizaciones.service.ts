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

  private readonly estadosPermitidos: EstadoCotizacion[] = [
    EstadoCotizacion.borrador,
    EstadoCotizacion.enviada,
    EstadoCotizacion.aceptada,
    EstadoCotizacion.rechazada,
    EstadoCotizacion.cancelada,
  ];

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

  async listarTodas(filtros?: {
    estado?: string;
    desde?: string;
    hasta?: string;
    cliente?: string;
  }) {
    const where: Prisma.CotizacionWhereInput = {};

    const estado = filtros?.estado?.trim();
    if (estado) {
      if (!this.estadosPermitidos.includes(estado as EstadoCotizacion)) {
        throw new BadRequestException('El estado de cotización enviado no es válido.');
      }
      where.estado = estado as EstadoCotizacion;
    }

    const cliente = filtros?.cliente?.trim();
    if (cliente) {
      where.OR = [
        { contactoEmpresa: { contains: cliente } },
        { contactoNombre: { contains: cliente } },
        { usuario: { nombre: { contains: cliente } } },
        { usuario: { email: { contains: cliente } } },
      ];
    }

    const desde = filtros?.desde?.trim();
    const hasta = filtros?.hasta?.trim();
    if (desde || hasta) {
      where.creadoEn = {};
      if (desde) {
        const fechaDesde = new Date(`${desde}T00:00:00.000Z`);
        if (Number.isNaN(fechaDesde.getTime())) {
          throw new BadRequestException('La fecha "desde" no es válida.');
        }
        where.creadoEn.gte = fechaDesde;
      }

      if (hasta) {
        const fechaHasta = new Date(`${hasta}T23:59:59.999Z`);
        if (Number.isNaN(fechaHasta.getTime())) {
          throw new BadRequestException('La fecha "hasta" no es válida.');
        }
        where.creadoEn.lte = fechaHasta;
      }
    }

    return this.prisma.cotizacion.findMany({
      where,
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
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: { items: true },
    });
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

    if (estado === EstadoCotizacion.aceptada && cotizacion.estado === EstadoCotizacion.aceptada) {
      return cotizacion;
    }

    if (estado === EstadoCotizacion.aceptada) {
      return this.prisma.$transaction(async (tx) => {
        for (const item of cotizacion.items) {
          const producto = await tx.producto.findUnique({ where: { id: item.productoId } });
          if (!producto || !producto.activo) {
            throw new BadRequestException(
              `El producto ${item.productoId} no existe o está inactivo.`,
            );
          }
          if (producto.stock < item.cantidad) {
            throw new BadRequestException(
              `Stock insuficiente para ${producto.nombre}: disponible ${producto.stock}, solicitado ${item.cantidad}.`,
            );
          }
        }

        for (const item of cotizacion.items) {
          await tx.producto.update({
            where: { id: item.productoId },
            data: { stock: { decrement: item.cantidad } },
          });
        }

        return tx.cotizacion.update({
          where: { id },
          data: { estado },
          include: {
            items: { include: { producto: true } },
          },
        });
      });
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
