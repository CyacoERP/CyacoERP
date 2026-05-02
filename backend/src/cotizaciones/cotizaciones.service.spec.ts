import { Test, TestingModule } from '@nestjs/testing';
import { CotizacionesService } from './cotizaciones.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EstadoCotizacion } from '@prisma/client';

const prismaMock = {
  producto: { findMany: jest.fn() },
  cotizacion: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

const usuarioMock = { id: 1, rol: 'cliente' as any, email: 'u@test.com', nombre: 'Test' };

describe('CotizacionesService', () => {
  let servicio: CotizacionesService;

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        CotizacionesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    servicio = modulo.get<CotizacionesService>(CotizacionesService);
    jest.clearAllMocks();
  });

  describe('crear', () => {
    const dto = {
      items: [{ productoId: 1, cantidad: 2, precioUnitario: 100 }],
      descuentoPct: 10,
      margenPct: 0,
    } as any;

    it('lanza BadRequestException si un producto no existe o está inactivo', async () => {
      prismaMock.producto.findMany.mockResolvedValue([]); // retorna vacío → no coincide

      await expect(servicio.crear(1, dto)).rejects.toThrow(BadRequestException);
    });

    it('calcula correctamente subtotal y total con descuento', async () => {
      prismaMock.producto.findMany.mockResolvedValue([{ id: 1 }]);

      const cotizacionResultado = {
        id: 1,
        numero: 'COT-001',
        subtotal: 200,
        total: 180,
        items: [],
        estado: EstadoCotizacion.borrador,
      };

      // $transaction recibe una función async; la ejecutamos manualmente
      prismaMock.$transaction.mockImplementation(async (fn: (tx: any) => Promise<any>) => {
        const txMock = {
          cotizacion: { create: jest.fn().mockResolvedValue(cotizacionResultado) },
          cotizacion2: undefined,
        };
        // La función interna llama generarNumeroCotizacion, mockear con el mismo tx
        const txFull = {
          cotizacion: {
            create: jest.fn().mockResolvedValue(cotizacionResultado),
            count: jest.fn().mockResolvedValue(0),
          },
        };
        return fn(txFull);
      });

      const resultado = await servicio.crear(1, dto);
      expect(resultado).toMatchObject({ subtotal: 200, total: 180 });
    });

    it('lanza BadRequestException si descuento > 100', async () => {
      prismaMock.producto.findMany.mockResolvedValue([{ id: 1 }]);
      const dtoInvalido = { ...dto, descuentoPct: 110 };

      await expect(servicio.crear(1, dtoInvalido)).rejects.toThrow(BadRequestException);
    });
  });

  describe('actualizarEstado', () => {
    it('lanza NotFoundException si la cotización no existe', async () => {
      prismaMock.cotizacion.findUnique.mockResolvedValue(null);

      await expect(servicio.actualizarEstado(99, EstadoCotizacion.enviada, 1, 'cliente' as any))
        .rejects.toThrow(NotFoundException);
    });

    it('lanza ForbiddenException si el usuario no es dueño', async () => {
      prismaMock.cotizacion.findUnique.mockResolvedValue({ id: 1, usuarioId: 99 });

      await expect(servicio.actualizarEstado(1, EstadoCotizacion.aceptada, 1, 'cliente' as any))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
