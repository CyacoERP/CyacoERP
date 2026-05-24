import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';

export class ActualizarPrecioItemDto {
  @IsNumber()
  itemId!: number;

  @IsNumber()
  @Min(0)
  precioUnitario!: number;
}

export class ActualizarPreciosCotizacionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  descuentoPct?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  margenPct?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActualizarPrecioItemDto)
  items?: ActualizarPrecioItemDto[];
}
