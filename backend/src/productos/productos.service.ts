import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Producto, Categoria } from '@prisma/client';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Producto[]> {
    return this.prisma.producto.findMany({ include: { categoria: true } });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.prisma.producto.findUnique({ where: { id }, include: { categoria: true } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async create(data: any): Promise<Producto> {
    return this.prisma.producto.create({ data });
  }

  async update(id: number, data: any): Promise<Producto> {
    return this.prisma.producto.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Producto> {
    return this.prisma.producto.delete({ where: { id } });
  }

  async actualizarUrlDocumento(id: number, urlDocumento: string): Promise<Producto> {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException(`Producto ${id} no encontrado.`);
    return this.prisma.producto.update({ where: { id }, data: { urlDocumento } });
  }
}

