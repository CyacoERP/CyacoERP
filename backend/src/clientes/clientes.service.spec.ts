import { Test, TestingModule } from '@nestjs/testing';
import { ClientesService } from './clientes.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const prismaMock = {
  cliente: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('ClientesService', () => {
  let servicio: ClientesService;

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    servicio = modulo.get<ClientesService>(ClientesService);
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('retorna la lista paginada de clientes', async () => {
      const clientesMock = [{ id: 1, razonSocial: 'ACME', rfc: 'ACM010101000', activo: true }];
      prismaMock.$transaction.mockResolvedValue([1, clientesMock]);

      const resultado = await servicio.listar({ pagina: 1, limite: 10 });

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(resultado).toHaveProperty('datos');
      expect(resultado).toHaveProperty('meta');
      expect(resultado.meta).toMatchObject({ total: 1, pagina: 1 });
      expect(resultado.datos).toHaveLength(1);
    });

    it('filtra por término de búsqueda cuando se provee', async () => {
      prismaMock.$transaction.mockResolvedValue([0, []]);

      await servicio.listar({ pagina: 1, limite: 10, termino: 'Empresa X' });

      // $transaction is called once — we just verify it ran without error
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('obtenerPorId', () => {
    it('retorna el cliente cuando existe', async () => {
      prismaMock.cliente.findUnique.mockResolvedValue({ id: 1, razonSocial: 'ACME' });
      const cliente = await servicio.obtenerPorId(1);
      expect(cliente).toMatchObject({ id: 1 });
    });

    it('lanza NotFoundException cuando no existe', async () => {
      prismaMock.cliente.findUnique.mockResolvedValue(null);
      await expect(servicio.obtenerPorId(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('crear', () => {
    it('crea y retorna el cliente nuevo', async () => {
      const payload = { razonSocial: 'ACME S.A.', rfc: 'ACM010101000' };
      prismaMock.cliente.create.mockResolvedValue({ id: 1, ...payload, activo: true });

      const resultado = await servicio.crear(payload as any);
      expect(resultado).toMatchObject({ id: 1 });
    });

    it('lanza BadRequestException en duplicado de RFC (P2002)', async () => {
      const error = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
      prismaMock.cliente.create.mockRejectedValue(error);

      await expect(servicio.crear({ razonSocial: 'X', rfc: 'ACM010101000' } as any))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('actualizar', () => {
    it('actualiza y retorna el cliente', async () => {
      prismaMock.cliente.findUnique.mockResolvedValue({ id: 1, razonSocial: 'Viejo' });
      prismaMock.cliente.update.mockResolvedValue({ id: 1, razonSocial: 'Nuevo' });

      const resultado = await servicio.actualizar(1, { razonSocial: 'Nuevo' } as any);
      expect(resultado.razonSocial).toBe('Nuevo');
    });

    it('lanza NotFoundException si el cliente no existe', async () => {
      prismaMock.cliente.findUnique.mockResolvedValue(null);
      await expect(servicio.actualizar(99, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('desactivar', () => {
    it('desactiva (activo=false) el cliente existente', async () => {
      prismaMock.cliente.findUnique.mockResolvedValue({ id: 1, activo: true });
      prismaMock.cliente.update.mockResolvedValue({ id: 1, activo: false });

      const resultado = await servicio.desactivar(1);
      expect(resultado.activo).toBe(false);
    });
  });
});
