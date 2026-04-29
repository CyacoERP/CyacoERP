import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Categoria } from '@prisma/client';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Categoria[]> {
    return this.prisma.categoria.findMany();
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.prisma.categoria.findUnique({ where: { id } });
    if (!categoria) throw new NotFoundException('Categoría no encontrada');
    return categoria;
  }

  async create(data: any): Promise<Categoria> {
    return this.prisma.categoria.create({ data });
  }

  async update(id: number, data: any): Promise<Categoria> {
    return this.prisma.categoria.update({ where: { id }, data });
  }

  async remove(id: number): Promise<Categoria> {
    return this.prisma.categoria.delete({ where: { id } });
  }
}
