import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ReportesService } from './reportes.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('dashboard/ventas')
  obtenerDashboardVentas() {
    return this.reportesService.obtenerDashboardVentas();
  }

  @Get('dashboard/clientes')
  obtenerDashboardClientes() {
    return this.reportesService.obtenerDashboardClientes();
  }

  @Get('dashboard/proyectos')
  obtenerDashboardProyectos() {
    return this.reportesService.obtenerDashboardProyectos();
  }

  @Get()
  obtenerReportes() {
    return this.reportesService.obtenerReportes();
  }

  @Post('generar')
  generarReporte(
    @Body()
    payload: {
      tipo: 'ventas' | 'clientes' | 'proyectos' | 'inventario';
      formato: 'pdf' | 'excel' | 'csv';
      filtros?: unknown;
    },
  ) {
    return this.reportesService.generarReporte(payload.tipo, payload.formato, payload.filtros);
  }

  @Get(':id/exportar/:formato')
  @Header('Cache-Control', 'no-store')
  async exportar(
    @Param('id', ParseIntPipe) id: number,
    @Param('formato') formato: string,
    @Res() res: Response,
  ) {
    const fmt = formato.toLowerCase();

    if (fmt === 'pdf') {
      const buffer = await this.reportesService.exportarReportePdf(id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reporte-${id}.pdf"`);
      return res.send(buffer);
    }

    if (fmt === 'excel' || fmt === 'xlsx') {
      const buffer = await this.reportesService.exportarReporteExcel(id);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="reporte-${id}.xlsx"`);
      return res.send(buffer);
    }

    // CSV / default
    const archivo = this.reportesService.exportarReporteCsv(id);
    res.setHeader('Content-Type', archivo.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${archivo.fileName}"`);
    return res.send(archivo.contenido);
  }
}
