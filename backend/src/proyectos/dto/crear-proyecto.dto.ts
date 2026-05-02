import { IsDateString, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CrearProyectoDto {
  @IsString()
  @MaxLength(180)
  nombre!: string;

  @IsString()
  @MaxLength(500)
  descripcion!: string;

  @IsString()
  @MaxLength(180)
  cliente!: string;

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFinEstimada!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  gerente?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  presupuesto?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeAvance?: number;
}
