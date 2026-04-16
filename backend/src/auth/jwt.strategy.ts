import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, UsuarioAutenticado } from './interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'cyaco_dev_secret_change_me',
    });
  }

  validate(payload: JwtPayload): UsuarioAutenticado {
    return {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };
  }
}
