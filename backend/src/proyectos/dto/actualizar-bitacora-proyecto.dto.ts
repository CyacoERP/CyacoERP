import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ActualizarBitacoraProyectoDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nota?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  avance?: number;
}
