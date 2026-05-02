import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EstadoTareaProyecto } from '@prisma/client';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../auth/interfaces';
import { ProyectosService } from './proyectos.service';
import { ActualizarEstadoProyectoDto } from './dto/actualizar-estado-proyecto.dto';
import { ActualizarProyectoDto } from './dto/actualizar-proyecto.dto';
import { ActualizarTareaProyectoDto } from './dto/actualizar-tarea-proyecto.dto';
import { CrearBitacoraProyectoDto } from './dto/crear-bitacora-proyecto.dto';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { CrearTareaProyectoDto } from './dto/crear-tarea-proyecto.dto';

@UseGuards(JwtAuthGuard)
@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Get()
  listar(@UsuarioActual() usuario: UsuarioAutenticado | undefined) {
    return this.proyectosService.listar(usuario as UsuarioAutenticado);
  }

  @Get('filtro/activos')
  listarActivos(@UsuarioActual() usuario: UsuarioAutenticado | undefined) {
    return this.proyectosService.listarActivos(usuario as UsuarioAutenticado);
  }

  @Get(':id')
  obtenerPorId(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.obtenerPorId(id, usuario as UsuarioAutenticado);
  }

  @Post()
  crear(
    @Body() dto: CrearProyectoDto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.crear(dto, usuario as UsuarioAutenticado);
  }

  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarProyectoDto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.actualizar(id, dto, usuario as UsuarioAutenticado);
  }

  @Patch(':id/estado')
  actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarEstadoProyectoDto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.actualizarEstado(id, dto, usuario as UsuarioAutenticado);
  }

  @Delete(':id')
  desactivar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.desactivar(id, usuario as UsuarioAutenticado);
  }

  @Get(':id/tareas')
  listarTareas(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.listarTareas(id, usuario as UsuarioAutenticado);
  }

  @Post(':id/tareas')
  crearTarea(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearTareaProyectoDto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.crearTarea(id, dto, usuario as UsuarioAutenticado);
  }

  @Patch(':id/tareas/:tareaId')
  actualizarTarea(
    @Param('id', ParseIntPipe) id: number,
    @Param('tareaId', ParseIntPipe) tareaId: number,
    @Body() dto: ActualizarTareaProyectoDto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.actualizarTarea(id, tareaId, dto, usuario as UsuarioAutenticado);
  }

  @Patch(':id/tareas/:tareaId/estado/:estado')
  moverEstadoTarea(
    @Param('id', ParseIntPipe) id: number,
    @Param('tareaId', ParseIntPipe) tareaId: number,
    @Param('estado') estado: EstadoTareaProyecto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.moverTareaEstado(
      id,
      tareaId,
      estado,
      usuario as UsuarioAutenticado,
    );
  }

  @Get(':id/bitacora')
  listarBitacora(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.listarBitacora(id, usuario as UsuarioAutenticado);
  }

  @Post(':id/bitacora')
  agregarBitacora(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CrearBitacoraProyectoDto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.proyectosService.agregarBitacora(id, dto, usuario as UsuarioAutenticado);
  }
}
