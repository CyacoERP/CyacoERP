import { IsBoolean, IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CrearClienteDto {
  @IsString()
  @MaxLength(180)
  razonSocial!: string;

  @IsString()
  @Length(12, 13)
  rfc!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  sector?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
