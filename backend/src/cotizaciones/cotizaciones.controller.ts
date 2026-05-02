import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolUsuario } from '@prisma/client';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioAutenticado } from '../auth/interfaces';
import { CotizacionesService } from './cotizaciones.service';
import { ActualizarEstadoCotizacionDto } from './dto/actualizar-estado-cotizacion.dto';
import { CrearCotizacionDto } from './dto/crear-cotizacion.dto';

@UseGuards(JwtAuthGuard)
@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private readonly cotizacionesService: CotizacionesService) {}

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
  listarTodas() {
    return this.cotizacionesService.listarTodas();
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
}
