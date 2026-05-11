import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  ParseIntPipe,
  Query,
  Header,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  MonedaProducto,
  TipoCompatibilidad,
} from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { basename, extname, join } from 'path';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProductosService } from './productos.service';

const UPLOADS_DIR = join(process.cwd(), 'uploads', 'documentos');

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  findAll(
    @Query('categoriaId') categoriaId?: string,
    @Query('familia') familia?: string,
    @Query('fabricante') fabricante?: string,
    @Query('precioMin') precioMin?: string,
    @Query('precioMax') precioMax?: string,
    @Query('busqueda') busqueda?: string,
    @Query('incluirInactivos') incluirInactivos?: string,
  ) {
    return this.productosService.findAll({
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      familia,
      fabricante,
      precioMin: precioMin != null ? Number(precioMin) : undefined,
      precioMax: precioMax != null ? Number(precioMax) : undefined,
      busqueda,
      incluirInactivos: incluirInactivos === 'true',
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Get(':id/documento')
  @Header('Cache-Control', 'no-store')
  async descargarDocumento(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const relativePath = await this.productosService.obtenerRutaDocumento(id);
    const fullPath = join(process.cwd(), relativePath.replace(/^\//, '').replaceAll('/', '\\'));

    if (!existsSync(fullPath)) {
      throw new BadRequestException('No se encontró el archivo del documento.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${basename(fullPath)}"`);
    return createReadStream(fullPath).pipe(res);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(
    @Body()
    data: {
      nombre: string;
      descripcion?: string;
      fabricante?: string;
      numeroParte?: string;
      skuInterno?: string;
      familia?: string;
      moneda?: MonedaProducto;
      especificacionesTecnicas?: unknown;
      precio: number;
      stock?: number;
      imagenUrl?: string;
      categoriaId: number;
    },
  ) {
    return this.productosService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: Partial<{
      nombre: string;
      descripcion: string;
      fabricante: string;
      numeroParte: string;
      skuInterno: string;
      familia: string;
      moneda: MonedaProducto;
      especificacionesTecnicas: unknown;
      precio: number;
      stock: number;
      imagenUrl: string;
      categoriaId: number;
      activo: boolean;
    }>,
  ) {
    return this.productosService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }

  @Get(':id/compatibilidades')
  listarCompatibilidades(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.listarCompatibilidades(id);
  }

  @Post(':id/compatibilidades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  crearCompatibilidad(
    @Param('id', ParseIntPipe) productoOrigenId: number,
    @Body()
    data: {
      productoDestinoId: number;
      tipo: TipoCompatibilidad;
      nota?: string;
    },
  ) {
    return this.productosService.crearCompatibilidad({ ...data, productoOrigenId });
  }

  @Delete(':id/compatibilidades/:compatibilidadId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  eliminarCompatibilidad(
    @Param('compatibilidadId', ParseIntPipe) compatibilidadId: number,
  ) {
    return this.productosService.eliminarCompatibilidad(compatibilidadId);
  }

  @Post(':id/documento')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          if (!existsSync(UPLOADS_DIR)) {
            mkdirSync(UPLOADS_DIR, { recursive: true });
          }
          cb(null, UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `doc-${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Solo se aceptan archivos PDF'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  async subirDocumento(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo.');
    }
    const urlDocumento = `/uploads/documentos/${file.filename}`;
    return this.productosService.actualizarUrlDocumento(id, urlDocumento);
  }
}
