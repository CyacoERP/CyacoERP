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
import { ProyectosModule } from './proyectos/proyectos.module';
import { ReportesModule } from './reportes/reportes.module';
import { PaypalModule } from './paypal/paypal.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientesModule,
    AuthModule,
    UsuariosModule,
    ProductosModule,
    CotizacionesModule,
    ProyectosModule,
    ReportesModule,
    PaypalModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
