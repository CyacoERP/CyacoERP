import { IsOptional, IsString, MinLength } from 'class-validator';

export class CambiarPasswordDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  passwordActual?: string;

  @IsString()
  @MinLength(8)
  passwordNueva!: string;
}
