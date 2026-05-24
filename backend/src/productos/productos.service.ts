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
    compatibilidades?: Array<{
      productoDestinoId: number;
      tipo: TipoCompatibilidad;
      nota?: string;
    }>;
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

    return this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({ data: payload });

      const compatibilidades = (data.compatibilidades ?? []).filter(
        (c) => c.productoDestinoId && c.productoDestinoId !== producto.id,
      );

      for (const compatibilidad of compatibilidades) {
        await tx.compatibilidadProducto.create({
          data: {
            productoOrigenId: producto.id,
            productoDestinoId: compatibilidad.productoDestinoId,
            tipo: compatibilidad.tipo,
            nota: compatibilidad.nota?.trim() || null,
          },
        });
      }

      return producto;
    });
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

  async activar(id: number): Promise<Producto> {
    await this.findOne(id);
    return this.prisma.producto.update({ where: { id }, data: { activo: true } });
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
    const compatibilidades = await this.prisma.compatibilidadProducto.findMany({
      where: {
        OR: [{ productoOrigenId: id }, { productoDestinoId: id }],
      },
      include: {
        productoOrigen: true,
        productoDestino: true,
      },
      orderBy: { creadoEn: 'desc' },
    });

    return compatibilidades.map((compatibilidad) => {
      if (compatibilidad.productoOrigenId === id) {
        return compatibilidad;
      }

      return {
        ...compatibilidad,
        productoOrigenId: id,
        productoDestinoId: compatibilidad.productoOrigenId,
        productoOrigen: compatibilidad.productoDestino,
        productoDestino: compatibilidad.productoOrigen,
      };
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

  async buscarIncompatibilidades(productoIds: number[]): Promise<Array<{
    nombre1: string;
    nombre2: string;
    razon?: string;
  }>> {
    if (!productoIds || productoIds.length < 2) {
      return [];
    }

    // Normalize ids to numbers in case they arrive as strings from JSON body
    const ids = productoIds.map(Number);

    // 1. Fetch names for all cart products
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: ids } },
      select: { id: true, nombre: true },
    });
    const nombrePorId = new Map(productos.map((p) => [p.id, p.nombre]));

    // 2. Fetch ALL compatibility relations where BOTH endpoints are in the cart
    const relaciones = await this.prisma.compatibilidadProducto.findMany({
      where: {
        productoOrigenId: { in: ids },
        productoDestinoId: { in: ids },
      },
    });

    const incompats: Array<{ nombre1: string; nombre2: string; razon?: string }> = [];

    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const id1 = ids[i];
        const id2 = ids[j];

        // Find relation between this pair (either direction)
        const rel = relaciones.find(
          (r) =>
            (r.productoOrigenId === id1 && r.productoDestinoId === id2) ||
            (r.productoOrigenId === id2 && r.productoDestinoId === id1),
        );

        if (rel && rel.tipo === 'incompatible') {
          // Explicit incompatibility declared
          incompats.push({
            nombre1: nombrePorId.get(id1) ?? `ID:${id1}`,
            nombre2: nombrePorId.get(id2) ?? `ID:${id2}`,
            razon: rel.nota ?? 'Incompatibilidad declarada',
          });
        } else if (!rel) {
          // No explicit compatible relation exists between these two products
          incompats.push({
            nombre1: nombrePorId.get(id1) ?? `ID:${id1}`,
            nombre2: nombrePorId.get(id2) ?? `ID:${id2}`,
            razon: 'Compatibilidad no verificada entre estos artículos',
          });
        }
        // If rel.tipo === 'compatible' → no warning
      }
    }

    return incompats;
  }
}

