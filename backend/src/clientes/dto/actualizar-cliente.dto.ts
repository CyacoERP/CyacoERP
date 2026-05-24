import { IsBoolean, IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class ActualizarClienteDto {
	@IsOptional()
	@IsString()
	@MaxLength(180)
	razonSocial?: string;

	@IsOptional()
	@IsString()
	@Length(12, 13)
	rfc?: string;

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
