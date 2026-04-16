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
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioAutenticado } from '../auth/interfaces';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { UsuariosService } from './usuarios.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.obtenerPorId(id);
  }

  @Post()
  crear(@Body() dto: CrearUsuarioDto) {
    return this.usuariosService.crear(dto);
  }

  @Put(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarUsuarioDto) {
    return this.usuariosService.actualizar(id, dto);
  }

  @Delete(':id')
  desactivar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.desactivar(id);
  }

  @Post(':id/cambiar-password')
  cambiarPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarPasswordDto,
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
  ) {
    return this.usuariosService.cambiarPassword(id, dto, usuario?.id ?? 0);
  }
}
