import { IsDateString, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ActualizarProyectoDto {
	@IsOptional()
	@IsString()
	@MaxLength(180)
	nombre?: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	descripcion?: string;

	@IsOptional()
	@IsString()
	@MaxLength(180)
	cliente?: string;

	@IsOptional()
	@IsDateString()
	fechaInicio?: string;

	@IsOptional()
	@IsDateString()
	fechaFinEstimada?: string;

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
