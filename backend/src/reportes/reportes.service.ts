import { Injectable, NotFoundException } from '@nestjs/common';
import { EstadoCotizacion, EstadoProyecto, EstadoTareaProyecto } from '@prisma/client';
import { Workbook } from 'exceljs';
// pdfkit ships as CJS; use require for reliable constructor access
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import { PrismaService } from '../prisma/prisma.service';

export interface ReporteGenerado {
  id: number;
  nombre: string;
  tipo: 'ventas' | 'clientes' | 'proyectos' | 'inventario';
  descripcion?: string;
  fechaGeneracion: Date;
  generadoPor: string;
  datos: unknown;
  formato: 'pdf' | 'excel' | 'csv';
}

@Injectable()
export class ReportesService {
  private secuencia = 1;
  private readonly reportes: ReporteGenerado[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async obtenerDashboardVentas() {
    const [totalCotizaciones, aceptadas, pendientes, totalVentas] = await Promise.all([
      this.prisma.cotizacion.count(),
      this.prisma.cotizacion.count({ where: { estado: EstadoCotizacion.aceptada } }),
      this.prisma.cotizacion.count({ where: { estado: EstadoCotizacion.enviada } }),
      this.prisma.cotizacion.aggregate({
        _sum: { total: true },
        where: { estado: EstadoCotizacion.aceptada },
      }),
    ]);

    const topProductos = await this.prisma.itemCotizacion.groupBy({
      by: ['productoId'],
      _sum: { cantidad: true, subtotal: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: 5,
    });

    return {
      totalVentas: totalVentas._sum.total ?? 0,
      totalCotizaciones,
      cotizacionesAceptadas: aceptadas,
      cotizacionesPendientes: pendientes,
      ultimosProductosVendidos: topProductos,
    };
  }

  async obtenerDashboardClientes() {
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const [totalClientes, clientesActivos, clientesNuevos] = await Promise.all([
      this.prisma.cliente.count(),
      this.prisma.cliente.count({ where: { activo: true } }),
      this.prisma.cliente.count({ where: { creadoEn: { gte: inicioMes } } }),
    ]);

    const topClientes = await this.prisma.proyecto.groupBy({
      by: ['cliente'],
      _sum: { presupuesto: true },
      _count: { cliente: true },
      orderBy: { _sum: { presupuesto: 'desc' } },
      take: 5,
    });

    return {
      totalClientes,
      clientesActivos,
      clientesNuevos,
      topClientes,
    };
  }

  async obtenerDashboardProyectos() {
    const [totalProyectos, activos, finalizados, avgAvance, proximos] = await Promise.all([
      this.prisma.proyecto.count({ where: { activo: true } }),
      this.prisma.proyecto.count({
        where: { activo: true, estado: { in: [EstadoProyecto.planificacion, EstadoProyecto.en_progreso] } },
      }),
      this.prisma.proyecto.count({ where: { activo: true, estado: EstadoProyecto.finalizado } }),
      this.prisma.proyecto.aggregate({
        _avg: { porcentajeAvance: true },
        where: { activo: true },
      }),
      this.prisma.tareaProyecto.findMany({
        where: { estado: { not: EstadoTareaProyecto.completada }, fechaEstimada: { not: null } },
        orderBy: { fechaEstimada: 'asc' },
        take: 5,
      }),
    ]);

    return {
      totalProyectos,
      proyectosActivos: activos,
      proyectosFinalizados: finalizados,
      proximosHitos: proximos,
      porcentajePromedioAvance: Math.round(avgAvance._avg.porcentajeAvance ?? 0),
    };
  }

  obtenerReportes() {
    return this.reportes;
  }

  async generarReporte(
    tipo: 'ventas' | 'clientes' | 'proyectos' | 'inventario',
    formato: 'pdf' | 'excel' | 'csv',
    filtros?: unknown,
  ) {
    const datos =
      tipo === 'ventas'
        ? await this.obtenerDashboardVentas()
        : tipo === 'clientes'
          ? await this.obtenerDashboardClientes()
          : await this.obtenerDashboardProyectos();

    const reporte: ReporteGenerado = {
      id: this.secuencia++,
      nombre: `Reporte ${tipo.toUpperCase()} ${new Date().toISOString().slice(0, 10)}`,
      tipo,
      descripcion: filtros ? `Generado con filtros: ${JSON.stringify(filtros)}` : undefined,
      fechaGeneracion: new Date(),
      generadoPor: 'Sistema',
      datos,
      formato,
    };

    this.reportes.unshift(reporte);
    return reporte;
  }

  async exportarReportePdf(id: number): Promise<Buffer> {
    const reporte = this.reportes.find((r) => r.id === id);
    if (!reporte) {
      throw new NotFoundException(`Reporte ${id} no encontrado.`);
    }

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('CyacoERP', { align: 'center' });
      doc
        .fontSize(14)
        .font('Helvetica')
        .text(reporte.nombre, { align: 'center' });
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .fillColor('#666')
        .text(`Generado: ${reporte.fechaGeneracion.toISOString().slice(0, 10)}`, { align: 'center' });
      doc.moveDown(1);

      // Separator
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#3d82f1').stroke();
      doc.moveDown(1);

      // Data rows
      const datos = reporte.datos as Record<string, unknown>;
      doc.fontSize(11).fillColor('#000');

      for (const [clave, valor] of Object.entries(datos)) {
        if (Array.isArray(valor)) continue;
        const etiqueta = clave.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
        doc.font('Helvetica-Bold').text(`${etiqueta}: `, { continued: true });
        doc.font('Helvetica').text(String(valor));
        doc.moveDown(0.3);
      }

      doc.end();
    });
  }

  async exportarReporteExcel(id: number): Promise<Buffer> {
    const reporte = this.reportes.find((r) => r.id === id);
    if (!reporte) {
      throw new NotFoundException(`Reporte ${id} no encontrado.`);
    }

    const workbook = new Workbook();
    workbook.creator = 'CyacoERP';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(reporte.tipo.toUpperCase());

    // Title row
    sheet.mergeCells('A1:B1');
    sheet.getCell('A1').value = reporte.nombre;
    sheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF102957' } };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    sheet.mergeCells('A2:B2');
    sheet.getCell('A2').value = `Fecha: ${reporte.fechaGeneracion.toISOString().slice(0, 10)}`;
    sheet.getCell('A2').font = { size: 10, color: { argb: 'FF666666' } };

    // Headers
    sheet.getRow(4).values = ['Métrica', 'Valor'];
    sheet.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3D82F1' } };

    sheet.columns = [
      { key: 'metrica', width: 36 },
      { key: 'valor', width: 28 },
    ];

    // Data rows
    const datos = reporte.datos as Record<string, unknown>;
    let rowIdx = 5;
    for (const [clave, valor] of Object.entries(datos)) {
      if (Array.isArray(valor)) continue;
      const etiqueta = clave.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      sheet.getRow(rowIdx).values = [etiqueta, String(valor)];
      if (rowIdx % 2 === 0) {
        sheet.getRow(rowIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FD' } };
      }
      rowIdx++;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  exportarReporteCsv(id: number): { fileName: string; mimeType: string; contenido: string } {
    const reporte = this.reportes.find((r) => r.id === id);
    if (!reporte) {
      throw new NotFoundException(`Reporte ${id} no encontrado.`);
    }

    const datos = reporte.datos as Record<string, unknown>;
    const lineas: string[] = ['Metrica,Valor'];

    for (const [clave, valor] of Object.entries(datos)) {
      if (Array.isArray(valor)) continue;
      const etiqueta = clave.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      lineas.push(`"${etiqueta}","${String(valor)}"`);
    }

    return {
      fileName: `reporte-${reporte.id}.csv`,
      mimeType: 'text/csv; charset=utf-8',
      contenido: lineas.join('\n'),
    };
  }
}

