import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CompatibilidadProducto,
  MonedaProducto,
  Prisma,
  Producto,
  TipoCompatibilidad,
} from '@prisma/client';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: {
    categoriaId?: number;
    familia?: string;
    fabricante?: string;
    precioMin?: number;
    precioMax?: number;
    busqueda?: string;
    incluirInactivos?: boolean;
  }): Promise<Producto[]> {
    const where: Prisma.ProductoWhereInput = {
      ...(query?.incluirInactivos ? {} : { activo: true }),
      ...(query?.categoriaId ? { categoriaId: query.categoriaId } : {}),
      ...(query?.familia ? { familia: { equals: query.familia.trim(), mode: 'insensitive' } } : {}),
      ...(query?.fabricante
        ? { fabricante: { equals: query.fabricante.trim(), mode: 'insensitive' } }
        : {}),
      ...(query?.precioMin != null || query?.precioMax != null
        ? {
            precio: {
              ...(query?.precioMin != null ? { gte: query.precioMin } : {}),
              ...(query?.precioMax != null ? { lte: query.precioMax } : {}),
            },
          }
        : {}),
      ...(query?.busqueda
        ? {
            OR: [
              { nombre: { contains: query.busqueda.trim(), mode: 'insensitive' } },
              { descripcion: { contains: query.busqueda.trim(), mode: 'insensitive' } },
              { fabricante: { contains: query.busqueda.trim(), mode: 'insensitive' } },
              { numeroParte: { contains: query.busqueda.trim(), mode: 'insensitive' } },
              { skuInterno: { contains: query.busqueda.trim(), mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.producto.findMany({
      where,
      include: {
        categoria: true,
        compatibilidadesOrigen: {
          include: { productoDestino: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        compatibilidadesOrigen: {
          include: { productoDestino: true },
        },
        compatibilidadesDestino: {
          include: { productoOrigen: true },
        },
      },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async create(data: {
    nombre: string;
    descripcion?: string;
    fabricante?: string;
    numeroParte?: string;
    skuInterno?: string;
    familia?: string;
    moneda?: MonedaProducto;
    especificacionesTecnicas?: unknown;
    precio: number;
    stock?: number;
    imagenUrl?: string;
    categoriaId: number;
  }): Promise<Producto> {
    const payload: Prisma.ProductoCreateInput = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
      fabricante: data.fabricante?.trim() || null,
      numeroParte: data.numeroParte?.trim() || null,
      skuInterno: data.skuInterno?.trim() || null,
      familia: data.familia?.trim() || null,
      moneda: data.moneda ?? MonedaProducto.MXN,
      especificacionesTecnicas: (data.especificacionesTecnicas as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      precio: data.precio,
      stock: data.stock ?? 0,
      imagenUrl: data.imagenUrl?.trim() || null,
      categoria: { connect: { id: data.categoriaId } },
      activo: true,
    };

    return this.prisma.producto.create({ data: payload });
  }

  async update(
    id: number,
    data: Partial<{
      nombre: string;
      descripcion: string;
      fabricante: string;
      numeroParte: string;
      skuInterno: string;
      familia: string;
      moneda: MonedaProducto;
      especificacionesTecnicas: unknown;
      precio: number;
      stock: number;
      imagenUrl: string;
      categoriaId: number;
      activo: boolean;
    }>,
  ): Promise<Producto> {
    await this.findOne(id);

    const payload: Prisma.ProductoUpdateInput = {
      ...(data.nombre != null ? { nombre: data.nombre.trim() } : {}),
      ...(data.descripcion != null ? { descripcion: data.descripcion.trim() || null } : {}),
      ...(data.fabricante != null ? { fabricante: data.fabricante.trim() || null } : {}),
      ...(data.numeroParte != null ? { numeroParte: data.numeroParte.trim() || null } : {}),
      ...(data.skuInterno != null ? { skuInterno: data.skuInterno.trim() || null } : {}),
      ...(data.familia != null ? { familia: data.familia.trim() || null } : {}),
      ...(data.moneda != null ? { moneda: data.moneda } : {}),
      ...(data.especificacionesTecnicas != null
        ? { especificacionesTecnicas: data.especificacionesTecnicas as Prisma.InputJsonValue }
        : {}),
      ...(data.precio != null ? { precio: data.precio } : {}),
      ...(data.stock != null ? { stock: data.stock } : {}),
      ...(data.imagenUrl != null ? { imagenUrl: data.imagenUrl.trim() || null } : {}),
      ...(data.categoriaId != null ? { categoria: { connect: { id: data.categoriaId } } } : {}),
      ...(data.activo != null ? { activo: data.activo } : {}),
    };

    return this.prisma.producto.update({ where: { id }, data: payload });
  }

  async remove(id: number): Promise<Producto> {
    await this.findOne(id);
    return this.prisma.producto.update({ where: { id }, data: { activo: false } });
  }

  async actualizarUrlDocumento(id: number, urlDocumento: string): Promise<Producto> {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException(`Producto ${id} no encontrado.`);
    return this.prisma.producto.update({ where: { id }, data: { urlDocumento } });
  }

  async obtenerRutaDocumento(id: number): Promise<string> {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      select: { urlDocumento: true },
    });
    if (!producto) throw new NotFoundException(`Producto ${id} no encontrado.`);
    if (!producto.urlDocumento) {
      throw new NotFoundException('El producto no tiene documento asociado.');
    }
    return producto.urlDocumento;
  }

  async listarCompatibilidades(id: number): Promise<CompatibilidadProducto[]> {
    await this.findOne(id);
    return this.prisma.compatibilidadProducto.findMany({
      where: { productoOrigenId: id },
      include: {
        productoOrigen: true,
        productoDestino: true,
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async crearCompatibilidad(data: {
    productoOrigenId: number;
    productoDestinoId: number;
    tipo: TipoCompatibilidad;
    nota?: string;
  }): Promise<CompatibilidadProducto> {
    if (data.productoOrigenId === data.productoDestinoId) {
      throw new BadRequestException('No se puede relacionar un producto consigo mismo.');
    }

    await this.findOne(data.productoOrigenId);
    await this.findOne(data.productoDestinoId);

    return this.prisma.compatibilidadProducto.create({
      data: {
        productoOrigenId: data.productoOrigenId,
        productoDestinoId: data.productoDestinoId,
        tipo: data.tipo,
        nota: data.nota?.trim() || null,
      },
      include: {
        productoOrigen: true,
        productoDestino: true,
      },
    });
  }

  async eliminarCompatibilidad(id: number): Promise<CompatibilidadProducto> {
    const existente = await this.prisma.compatibilidadProducto.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException(`Compatibilidad ${id} no encontrada.`);
    }
    return this.prisma.compatibilidadProducto.delete({ where: { id } });
  }
}

