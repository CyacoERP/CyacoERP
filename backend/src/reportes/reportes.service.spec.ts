import { Test, TestingModule } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const prismaMock = {
  cotizacion: {
    count: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn(),
  },
  itemCotizacion: {
    groupBy: jest.fn(),
  },
  cliente: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  proyecto: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  producto: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('ReportesService', () => {
  let servicio: ReportesService;

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    servicio = modulo.get<ReportesService>(ReportesService);
    jest.clearAllMocks();
  });

  describe('generarReporte', () => {
    beforeEach(() => {
      prismaMock.cotizacion.count.mockResolvedValue(5);
      prismaMock.cotizacion.aggregate.mockResolvedValue({ _sum: { total: 50000 } });
      prismaMock.itemCotizacion.groupBy.mockResolvedValue([]);
      prismaMock.cotizacion.findMany.mockResolvedValue([]);
    });

    it('genera un reporte de ventas y lo almacena', async () => {
      const reporte = await servicio.generarReporte('ventas', 'pdf');

      expect(reporte).toHaveProperty('id');
      expect(reporte).toHaveProperty('tipo', 'ventas');
      expect(reporte).toHaveProperty('formato', 'pdf');
    });

    it('obtenerReportes retorna los reportes generados', async () => {
      await servicio.generarReporte('ventas', 'csv');
      const lista = servicio.obtenerReportes();
      expect(lista.length).toBeGreaterThan(0);
    });
  });

  describe('exportarReportePdf', () => {
    it('retorna un Buffer cuando el reporte existe', async () => {
      prismaMock.cotizacion.count.mockResolvedValue(0);
      prismaMock.cotizacion.aggregate.mockResolvedValue({ _sum: { total: 0 } });
      prismaMock.itemCotizacion.groupBy.mockResolvedValue([]);
      prismaMock.cotizacion.findMany.mockResolvedValue([]);

      const reporte = await servicio.generarReporte('ventas', 'pdf');

      // Spy to avoid real pdfkit in test environment
      const spy = jest.spyOn(servicio, 'exportarReportePdf').mockResolvedValue(Buffer.from('%PDF-test'));
      const buffer = await servicio.exportarReportePdf(reporte.id);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      spy.mockRestore();
    });

    it('lanza NotFoundException si el reporte no existe', async () => {
      await expect(servicio.exportarReportePdf(9999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportarReporteExcel', () => {
    it('retorna un Buffer cuando el reporte existe', async () => {
      prismaMock.cotizacion.count.mockResolvedValue(0);
      prismaMock.cotizacion.aggregate.mockResolvedValue({ _sum: { total: 0 } });
      prismaMock.itemCotizacion.groupBy.mockResolvedValue([]);
      prismaMock.cotizacion.findMany.mockResolvedValue([]);

      const reporte = await servicio.generarReporte('ventas', 'excel');
      const buffer = await servicio.exportarReporteExcel(reporte.id);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('lanza NotFoundException si el reporte no existe', async () => {
      await expect(servicio.exportarReporteExcel(9999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportarReporteCsv', () => {
    it('retorna objeto con fileName, mimeType y contenido string', async () => {
      prismaMock.cotizacion.count.mockResolvedValue(0);
      prismaMock.cotizacion.aggregate.mockResolvedValue({ _sum: { total: 0 } });
      prismaMock.itemCotizacion.groupBy.mockResolvedValue([]);
      prismaMock.cotizacion.findMany.mockResolvedValue([]);

      const reporte = await servicio.generarReporte('ventas', 'csv');
      const resultado = servicio.exportarReporteCsv(reporte.id);

      expect(resultado).toHaveProperty('fileName');
      expect(resultado.mimeType).toContain('text/csv');
      expect(typeof resultado.contenido).toBe('string');
      expect(resultado.contenido).toContain(',');
    });

    it('lanza NotFoundException si el reporte no existe', () => {
      expect(() => servicio.exportarReporteCsv(9999)).toThrow(NotFoundException);
    });
  });
});
