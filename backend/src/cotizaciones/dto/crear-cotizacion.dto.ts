import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CrearItemCotizacionDto } from './crear-item-cotizacion.dto';

export class CrearCotizacionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CrearItemCotizacionDto)
  items!: CrearItemCotizacionDto[];

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  descuentoPct?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  margenPct?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  contactoNombre?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  contactoCorreo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  contactoTelefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactoCargo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  contactoEmpresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  proyectoNombre?: string;

  @IsOptional()
  @IsDateString()
  fechaRequerida?: string;
}
