import { EstadoProyecto } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class ActualizarEstadoProyectoDto {
  @IsEnum(EstadoProyecto)
  estado!: EstadoProyecto;
}
