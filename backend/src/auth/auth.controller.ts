import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuarioActual } from './decorators/usuario-actual.decorator';
import { UsuarioAutenticado } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registro(@Body() dto: RegistroDto) {
    return this.authService.registro(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  perfil(@UsuarioActual() usuario: UsuarioAutenticado | undefined) {
    return this.authService.perfil(usuario?.id ?? 0);
  }

  @UseGuards(JwtAuthGuard)
  @Put('perfil')
  actualizarPerfil(
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
    @Body() dto: ActualizarPerfilDto,
  ) {
    return this.authService.actualizarPerfil(usuario?.id ?? 0, dto);
  }
}
