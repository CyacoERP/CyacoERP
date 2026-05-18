import { IsOptional, IsString, MaxLength, Matches, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class ActualizarPerfilDto {
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(160)
  correo?: string;

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
