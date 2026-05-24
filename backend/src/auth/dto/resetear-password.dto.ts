import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetearPasswordDto {
  @IsEmail({}, { message: 'Correo electrónico inválido.' })
  @IsNotEmpty()
  email!: string;

  @IsString()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos.' })
  codigo!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  nuevaPassword!: string;
}
