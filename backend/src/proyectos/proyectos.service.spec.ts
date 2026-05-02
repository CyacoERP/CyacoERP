import { Test, TestingModule } from '@nestjs/testing';
import { ProyectosService } from './proyectos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { EstadoProyecto, RolUsuario } from '@prisma/client';

const prismaMock = {
  proyecto: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  tareaProyecto: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  bitacoraProyecto: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

const adminMock = { id: 1, rol: RolUsuario.admin, email: 'admin@test.com', nombre: 'Admin' };
const clienteMock = { id: 2, rol: RolUsuario.cliente, email: 'cliente@test.com', nombre: 'Cliente' };

const proyectoBase = {
  id: 1,
  nombre: 'Proyecto Alpha',
  descripcion: 'Desc',
  cliente: 'Empresa X',
  estado: EstadoProyecto.planificacion,
  porcentajeAvance: 0,
  fechaInicio: new Date(),
  fechaFinEstimada: new Date(),
  gerente: null,
  presupuesto: 0,
  activo: true,
  usuarioId: 2,
  creadoEn: new Date(),
  actualizadoEn: new Date(),
  tareas: [],
};

describe('ProyectosService', () => {
  let servicio: ProyectosService;

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        ProyectosService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    servicio = modulo.get<ProyectosService>(ProyectosService);
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('admin ve todos los proyectos activos sin filtro de usuarioId', async () => {
      prismaMock.proyecto.findMany.mockResolvedValue([proyectoBase]);

      const resultado = await servicio.listar(adminMock);

      const llamada = prismaMock.proyecto.findMany.mock.calls[0][0];
      expect(llamada.where).not.toHaveProperty('usuarioId');
      expect(resultado).toHaveLength(1);
    });

    it('cliente solo ve sus propios proyectos', async () => {
      prismaMock.proyecto.findMany.mockResolvedValue([proyectoBase]);

      await servicio.listar(clienteMock);

      const llamada = prismaMock.proyecto.findMany.mock.calls[0][0];
      expect(llamada.where).toMatchObject({ usuarioId: clienteMock.id });
    });
  });

  describe('obtenerPorId', () => {
    it('retorna el proyecto si el usuario tiene permiso', async () => {
      prismaMock.proyecto.findUnique.mockResolvedValue(proyectoBase);

      const resultado = await servicio.obtenerPorId(1, clienteMock);
      expect(resultado).toMatchObject({ id: 1 });
    });

    it('lanza NotFoundException si no existe', async () => {
      prismaMock.proyecto.findUnique.mockResolvedValue(null);
      await expect(servicio.obtenerPorId(99, adminMock)).rejects.toThrow(NotFoundException);
    });

    it('lanza ForbiddenException si cliente intenta ver proyecto ajeno', async () => {
      const proyectoAjeno = { ...proyectoBase, usuarioId: 999 };
      prismaMock.proyecto.findUnique.mockResolvedValue(proyectoAjeno);
      await expect(servicio.obtenerPorId(1, clienteMock)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('crear', () => {
    it('crea el proyecto con estado planificacion y usuarioId del creador', async () => {
      const dto = {
        nombre: 'Nuevo',
        descripcion: 'Desc',
        cliente: 'Cliente SA',
        fechaInicio: '2025-01-01',
        fechaFinEstimada: '2025-12-31',
      } as any;

      prismaMock.proyecto.create.mockResolvedValue({ ...proyectoBase, ...dto, tareas: [] });

      const resultado = await servicio.crear(dto, adminMock);

      const data = prismaMock.proyecto.create.mock.calls[0][0].data;
      expect(data.estado).toBe(EstadoProyecto.planificacion);
      expect(data.usuarioId).toBe(adminMock.id);
      expect(resultado).toHaveProperty('id');
    });
  });

  describe('crearTarea', () => {
    it('lanza NotFoundException si el proyecto no existe', async () => {
      prismaMock.proyecto.findUnique.mockResolvedValue(null);
      await expect(servicio.crearTarea(99, {} as any, adminMock)).rejects.toThrow(NotFoundException);
    });

    it('crea la tarea y la retorna', async () => {
      prismaMock.proyecto.findUnique.mockResolvedValue(proyectoBase);
      prismaMock.tareaProyecto.count.mockResolvedValue(0);
      const tareaCreada = { id: 10, titulo: 'Tarea 1', proyectoId: 1, progreso: 0 };
      prismaMock.tareaProyecto.create.mockResolvedValue(tareaCreada);
      // recalcularAvanceProyecto needs findMany + proyecto.update
      prismaMock.tareaProyecto.findMany.mockResolvedValue([tareaCreada]);
      prismaMock.proyecto.update.mockResolvedValue(proyectoBase);

      const resultado = await servicio.crearTarea(1, { titulo: 'Tarea 1' } as any, adminMock);
      expect(resultado).toMatchObject({ id: 10 });
    });
  });

  describe('agregarBitacora', () => {
    it('lanza NotFoundException si el proyecto no existe', async () => {
      prismaMock.proyecto.findUnique.mockResolvedValue(null);
      await expect(servicio.agregarBitacora(99, {} as any, adminMock)).rejects.toThrow(NotFoundException);
    });

    it('crea la entrada de bitácora', async () => {
      prismaMock.proyecto.findUnique.mockResolvedValue(proyectoBase);
      const entradaMock = { id: 1, proyectoId: 1, nota: 'Avance ok', usuarioId: 1 };
      prismaMock.bitacoraProyecto.create.mockResolvedValue(entradaMock);

      const resultado = await servicio.agregarBitacora(1, { nota: 'Avance ok', avance: 50 } as any, adminMock);
      expect(resultado).toMatchObject({ id: 1 });
    });
  });
});
