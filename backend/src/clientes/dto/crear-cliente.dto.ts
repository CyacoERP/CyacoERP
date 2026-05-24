import { IsBoolean, IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CrearClienteDto {
  @IsString()
  @MaxLength(180)
  razonSocial!: string;

  @IsString()
  @Length(12, 13)
  rfc!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigoPostal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  sector?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
