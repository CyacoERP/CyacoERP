import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ClientesModule } from './clientes/clientes.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { CotizacionesModule } from './cotizaciones/cotizaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientesModule,
    AuthModule,
    UsuariosModule,
    ProductosModule,
    CotizacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
