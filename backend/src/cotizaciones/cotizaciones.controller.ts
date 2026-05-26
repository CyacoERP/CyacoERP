import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioAutenticado } from '../auth/interfaces';
import { CotizacionesService } from './cotizaciones.service';
import { EmailService } from '../auth/email.service';
import { ActualizarEstadoCotizacionDto } from './dto/actualizar-estado-cotizacion.dto';
import { ActualizarPreciosCotizacionDto } from './dto/actualizar-precios-cotizacion.dto';
import { CrearCotizacionDto } from './dto/crear-cotizacion.dto';

@UseGuards(JwtAuthGuard)
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(
    private readonly cotizacionesService: CotizacionesService,
    private readonly emailService: EmailService,
  ) {}

  @Post(':id/enviar-por-correo')
  async enviarPorCorreo(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    const detalle = await this.cotizacionesService.obtenerPorId(
      id,
      usuario?.id ?? 0,
      (usuario?.rol ?? RolUsuario.cliente) as RolUsuario,
    );

    const { pdf, xml, pdfFilename, xmlFilename } = await this.cotizacionesService.generarPdfYXmlFromCotizacion(
      detalle,
    );

    const destinatario = detalle.usuario?.email ?? detalle.contactoCorreo ?? usuario?.email ?? '';
    if (!destinatario) {
      return { ok: false, message: 'No se encontró correo del destinatario.' };
    }

    await this.emailService.enviarPdfCotizacion(
      destinatario,
      `Cotización ${detalle.numero}`,
      `<p>Adjunto encontrarás la cotización <strong>${detalle.numero}</strong>.</p>`,
      pdf,
      pdfFilename,
      xml,
      xmlFilename,
    );

    return { ok: true };
  }

  @Post()
  crear(
    @Body() dto: CrearCotizacionDto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.cotizacionesService.crear(usuario?.id ?? 0, dto);
  }

  @Get('mis')
  listarMis(@UsuarioActual() usuario: UsuarioAutenticado | undefined) {
    return this.cotizacionesService.listarPropias(usuario?.id ?? 0);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  listarTodas(
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('cliente') cliente?: string,
  ) {
    return this.cotizacionesService.listarTodas({ estado, desde, hasta, cliente });
  }

  @Get(':id')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.cotizacionesService.obtenerPorId(
      id,
      usuario?.id ?? 0,
      (usuario?.rol ?? RolUsuario.cliente) as RolUsuario,
    );
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEstadoCotizacionDto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.cotizacionesService.actualizarEstado(
      id,
      dto.estado,
      usuario?.id ?? 0,
      (usuario?.rol ?? RolUsuario.cliente) as RolUsuario,
    );
  }

  @Patch(':id/precios')
  actualizarPreciosYDescuentos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarPreciosCotizacionDto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.cotizacionesService.actualizarPreciosYDescuentos(
      id,
      dto.descuentoPct,
      dto.margenPct,
      dto.items,
      usuario?.id ?? 0,
      (usuario?.rol ?? RolUsuario.cliente) as RolUsuario,
    );
  }
}
