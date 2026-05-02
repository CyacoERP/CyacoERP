import { IsInt, IsNumber, Min } from 'class-validator';

export class CrearItemCotizacionDto {
  @IsInt()
  @Min(1)
  productoId!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioUnitario!: number;
}
