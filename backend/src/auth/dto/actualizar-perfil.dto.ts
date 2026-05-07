import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class ActualizarPerfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[+\d\s\-()]*$/, { message: 'telefono debe contener solo digitos, espacios y +-()'})
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  empresa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargo?: string;
}
