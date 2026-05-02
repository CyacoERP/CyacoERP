import { EstadoCotizacion } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ActualizarEstadoCotizacionDto {
  @IsEnum(EstadoCotizacion)
  estado!: EstadoCotizacion;
}
