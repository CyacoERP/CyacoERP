"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientesService = class ClientesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async crear(dto) {
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
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async listar(query) {
        const pagina = query.pagina ?? 1;
        const limite = query.limite ?? 10;
        const termino = query.termino?.trim();
        const soloActivos = query.activo;
        const where = {
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
    async obtenerPorId(id) {
        const cliente = await this.prisma.cliente.findUnique({ where: { id } });
        if (!cliente) {
            throw new common_1.NotFoundException(`Cliente ${id} no encontrado`);
        }
        return cliente;
    }
    async actualizar(id, dto) {
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
        }
        catch (error) {
            this.handlePrismaError(error);
        }
    }
    async desactivar(id) {
        await this.obtenerPorId(id);
        return this.prisma.cliente.update({
            where: { id },
            data: { activo: false },
        });
    }
    handlePrismaError(error) {
        if (error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 'P2002') {
            throw new common_1.BadRequestException('Ya existe un cliente con ese RFC o email.');
        }
        throw new common_1.BadRequestException('No fue posible procesar la solicitud de cliente.');
    }
};
exports.ClientesService = ClientesService;
exports.ClientesService = ClientesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientesService);
//# sourceMappingURL=clientes.service.js.map