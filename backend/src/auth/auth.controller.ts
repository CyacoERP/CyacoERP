import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import { SolicitarRecuperacionDto } from './dto/solicitar-recuperacion.dto';
import { ResetearPasswordDto } from './dto/resetear-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuarioActual } from './decorators/usuario-actual.decorator';
import { UsuarioAutenticado } from './interfaces';

class CambiarPasswordPerfilDto {
  @IsString()
  @MinLength(1)
  passwordActual!: string;

  @IsString()
  @MinLength(8)
  passwordNueva!: string;
}

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

  @Post('recuperar-password')
  solicitarRecuperacion(@Body() dto: SolicitarRecuperacionDto) {
    return this.authService.solicitarRecuperacion(dto.email);
  }

  @Post('resetear-password')
  resetearPassword(@Body() dto: ResetearPasswordDto) {
    return this.authService.resetearPassword(dto.email, dto.codigo, dto.nuevaPassword);
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

  @UseGuards(JwtAuthGuard)
  @Put('perfil/password')
  cambiarPassword(
    @UsuarioActual() usuario: UsuarioAutenticado | undefined,
    @Body() dto: CambiarPasswordPerfilDto,
  ) {
    return this.authService.cambiarPasswordPerfil(
      usuario?.id ?? 0,
      dto.passwordActual,
      dto.passwordNueva,
    );
  }
}
