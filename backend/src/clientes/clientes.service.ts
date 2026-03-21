import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { ConsultarClientesDto } from './dto/consultar-clientes.dto';

@Injectable()
export class ClientesService {
	constructor(private readonly prisma: PrismaService) {}

	async crear(dto: CrearClienteDto) {
		try {
			return await this.prisma.cliente.create({
				data: {
					razonSocial: dto.razonSocial.trim(),
					rfc: dto.rfc.trim().toUpperCase(),
					email: dto.email?.trim().toLowerCase(),
					telefono: dto.telefono?.trim(),
					sector: dto.sector?.trim(),
					activo: dto.activo ?? true,
				},
			});
		} catch (error: unknown) {
			this.handlePrismaError(error);
		}
	}

	async listar(query: ConsultarClientesDto) {
		const pagina = query.pagina ?? 1;
		const limite = query.limite ?? 10;
		const termino = query.termino?.trim();
		const soloActivos = query.activo;

		const where: Prisma.ClienteWhereInput = {
			...(typeof soloActivos === 'boolean' ? { activo: soloActivos } : {}),
			...(termino
				? {
						OR: [
							{ razonSocial: { contains: termino, mode: 'insensitive' } },
							{ rfc: { contains: termino, mode: 'insensitive' } },
							{ email: { contains: termino, mode: 'insensitive' } },
						],
					}
				: {}),
		};

		const [total, datos] = await this.prisma.$transaction([
			this.prisma.cliente.count({ where }),
			this.prisma.cliente.findMany({
				where,
				skip: (pagina - 1) * limite,
				take: limite,
				orderBy: { creadoEn: 'desc' },
			}),
		]);

		return {
			datos,
			meta: {
				pagina,
				limite,
				total,
				totalPaginas: Math.ceil(total / limite) || 1,
			},
		};
	}

	async obtenerPorId(id: number) {
		const cliente = await this.prisma.cliente.findUnique({ where: { id } });
		if (!cliente) {
			throw new NotFoundException(`Cliente ${id} no encontrado`);
		}
		return cliente;
	}

	async actualizar(id: number, dto: ActualizarClienteDto) {
		await this.obtenerPorId(id);

		try {
			return await this.prisma.cliente.update({
				where: { id },
				data: {
					...(dto.razonSocial ? { razonSocial: dto.razonSocial.trim() } : {}),
					...(dto.rfc ? { rfc: dto.rfc.trim().toUpperCase() } : {}),
					...(dto.email !== undefined ? { email: dto.email?.trim().toLowerCase() || null } : {}),
					...(dto.telefono !== undefined ? { telefono: dto.telefono?.trim() || null } : {}),
					...(dto.sector !== undefined ? { sector: dto.sector?.trim() || null } : {}),
					...(dto.activo !== undefined ? { activo: dto.activo } : {}),
				},
			});
		} catch (error: unknown) {
			this.handlePrismaError(error);
		}
	}

	async desactivar(id: number) {
		await this.obtenerPorId(id);

		return this.prisma.cliente.update({
			where: { id },
			data: { activo: false },
		});
	}

	private handlePrismaError(error: unknown): never {
		if (
			error &&
			typeof error === 'object' &&
			'code' in error &&
			(error as { code?: string }).code === 'P2002'
		) {
			throw new BadRequestException('Ya existe un cliente con ese RFC o email.');
		}

		throw new BadRequestException('No fue posible procesar la solicitud de cliente.');
	}
}
