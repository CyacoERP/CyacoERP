import { IsEmail, IsNotEmpty } from 'class-validator';

export class SolicitarRecuperacionDto {
  @IsEmail({}, { message: 'Correo electrónico inválido.' })
  @IsNotEmpty()
  email!: string;
}
