import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EstadoProyecto,
  EstadoTareaProyecto,
  Proyecto,
  RolUsuario,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioAutenticado } from '../auth/interfaces';
import { ActualizarEstadoProyectoDto } from './dto/actualizar-estado-proyecto.dto';
import { ActualizarProyectoDto } from './dto/actualizar-proyecto.dto';
import { ActualizarTareaProyectoDto } from './dto/actualizar-tarea-proyecto.dto';
import { CrearBitacoraProyectoDto } from './dto/crear-bitacora-proyecto.dto';
import { CrearProyectoDto } from './dto/crear-proyecto.dto';
import { CrearTareaProyectoDto } from './dto/crear-tarea-proyecto.dto';

@Injectable()
export class ProyectosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(usuario: UsuarioAutenticado) {
    const where =
      usuario.rol === RolUsuario.admin
        ? { activo: true }
        : { activo: true, usuarioId: usuario.id };

    const proyectos = await this.prisma.proyecto.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      include: { tareas: { orderBy: { orden: 'asc' } } },
    });

    return proyectos.map((p) => this.mapearProyectoSalida(p));
  }

  async listarActivos(usuario: UsuarioAutenticado) {
    return this.listar(usuario);
  }

  async obtenerPorId(id: number, usuario: UsuarioAutenticado) {
    const proyecto = await this.prisma.proyecto.findUnique({
      where: { id },
      include: { tareas: { orderBy: { orden: 'asc' } } },
    });

    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException(`Proyecto ${id} no encontrado.`);
    }

    this.assertPermisoProyecto(proyecto, usuario);
    return this.mapearProyectoSalida(proyecto);
  }

  async crear(dto: CrearProyectoDto, usuario: UsuarioAutenticado) {
    const proyecto = await this.prisma.proyecto.create({
      data: {
        nombre: dto.nombre.trim(),
        descripcion: dto.descripcion.trim(),
        cliente: dto.cliente.trim(),
        estado: EstadoProyecto.planificacion,
        porcentajeAvance: dto.porcentajeAvance ?? 0,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFinEstimada: new Date(dto.fechaFinEstimada),
        gerente: dto.gerente?.trim() || null,
        presupuesto: dto.presupuesto ?? 0,
        usuarioId: usuario.id,
      },
      include: { tareas: true },
    });

    return this.mapearProyectoSalida(proyecto);
  }

  async actualizar(id: number, dto: ActualizarProyectoDto, usuario: UsuarioAutenticado) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException(`Proyecto ${id} no encontrado.`);
    }

    this.assertPermisoProyecto(proyecto, usuario);

    const actualizado = await this.prisma.proyecto.update({
      where: { id },
      data: {
        ...(dto.nombre ? { nombre: dto.nombre.trim() } : {}),
        ...(dto.descripcion ? { descripcion: dto.descripcion.trim() } : {}),
        ...(dto.cliente ? { cliente: dto.cliente.trim() } : {}),
        ...(dto.gerente !== undefined ? { gerente: dto.gerente?.trim() || null } : {}),
        ...(dto.presupuesto !== undefined ? { presupuesto: dto.presupuesto } : {}),
        ...(dto.porcentajeAvance !== undefined ? { porcentajeAvance: dto.porcentajeAvance } : {}),
        ...(dto.fechaInicio ? { fechaInicio: new Date(dto.fechaInicio) } : {}),
        ...(dto.fechaFinEstimada ? { fechaFinEstimada: new Date(dto.fechaFinEstimada) } : {}),
      },
      include: { tareas: { orderBy: { orden: 'asc' } } },
    });

    return this.mapearProyectoSalida(actualizado);
  }

  async actualizarEstado(
    id: number,
    dto: ActualizarEstadoProyectoDto,
    usuario: UsuarioAutenticado,
  ) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException(`Proyecto ${id} no encontrado.`);
    }

    this.assertPermisoProyecto(proyecto, usuario);

    const actualizado = await this.prisma.proyecto.update({
      where: { id },
      data: { estado: dto.estado },
      include: { tareas: { orderBy: { orden: 'asc' } } },
    });

    return this.mapearProyectoSalida(actualizado);
  }

  async desactivar(id: number, usuario: UsuarioAutenticado) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException(`Proyecto ${id} no encontrado.`);
    }

    this.assertPermisoProyecto(proyecto, usuario);

    await this.prisma.proyecto.update({ where: { id }, data: { activo: false } });
    return { mensaje: 'Proyecto desactivado correctamente.' };
  }

  async listarTareas(id: number, usuario: UsuarioAutenticado) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException(`Proyecto ${id} no encontrado.`);
    }

    this.assertPermisoProyecto(proyecto, usuario);

    return this.prisma.tareaProyecto.findMany({
      where: { proyectoId: id },
      orderBy: [{ orden: 'asc' }, { creadoEn: 'asc' }],
    });
  }

  async crearTarea(id: number, dto: CrearTareaProyectoDto, usuario: UsuarioAutenticado) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException(`Proyecto ${id} no encontrado.`);
    }

    this.assertPermisoProyecto(proyecto, usuario);

    const tarea = await this.prisma.tareaProyecto.create({
      data: {
        proyectoId: id,
        titulo: dto.titulo.trim(),
        descripcion: dto.descripcion?.trim() || null,
        orden: dto.orden ?? 0,
        fechaEstimada: dto.fechaEstimada ? new Date(dto.fechaEstimada) : null,
      },
    });

    await this.recalcularAvanceProyecto(id);
    return tarea;
  }

  async actualizarTarea(
    id: number,
    tareaId: number,
    dto: ActualizarTareaProyectoDto,
    usuario: UsuarioAutenticado,
  ) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException(`Proyecto ${id} no encontrado.`);
    }

    this.assertPermisoProyecto(proyecto, usuario);

    const tarea = await this.prisma.tareaProyecto.findFirst({ where: { id: tareaId, proyectoId: id } });
    if (!tarea) {
      throw new NotFoundException(`Tarea ${tareaId} no encontrada para el proyecto ${id}.`);
    }

    const actualizada = await this.prisma.tareaProyecto.update({
      where: { id: tareaId },
      data: {
        ...(dto.titulo ? { titulo: dto.titulo.trim() } : {}),
        ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion?.trim() || null } : {}),
        ...(dto.estado ? { estado: dto.estado } : {}),
        ...(dto.progreso !== undefined ? { progreso: dto.progreso } : {}),
        ...(dto.orden !== undefined ? { orden: dto.orden } : {}),
        ...(dto.fechaEstimada ? { fechaEstimada: new Date(dto.fechaEstimada) } : {}),
        ...(dto.fechaReal ? { fechaReal: new Date(dto.fechaReal) } : {}),
      },
    });

    await this.recalcularAvanceProyecto(id);
    return actualizada;
  }

  async moverTareaEstado(
    id: number,
    tareaId: number,
    estado: EstadoTareaProyecto,
    usuario: UsuarioAutenticado,
  ) {
    return this.actualizarTarea(
      id,
      tareaId,
      {
        estado,
        progreso: estado === EstadoTareaProyecto.completada ? 100 : undefined,
      },
      usuario,
    );
  }

  async listarBitacora(id: number, usuario: UsuarioAutenticado) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException(`Proyecto ${id} no encontrado.`);
    }

    this.assertPermisoProyecto(proyecto, usuario);

    return this.prisma.bitacoraProyecto.findMany({
      where: { proyectoId: id },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async agregarBitacora(id: number, dto: CrearBitacoraProyectoDto, usuario: UsuarioAutenticado) {
    const proyecto = await this.prisma.proyecto.findUnique({ where: { id } });
    if (!proyecto || !proyecto.activo) {
      throw new NotFoundException(`Proyecto ${id} no encontrado.`);
    }

    this.assertPermisoProyecto(proyecto, usuario);

    const bitacora = await this.prisma.bitacoraProyecto.create({
      data: {
        proyectoId: id,
        nota: dto.nota.trim(),
        avance: dto.avance ?? proyecto.porcentajeAvance,
      },
    });

    if (dto.avance !== undefined) {
      await this.prisma.proyecto.update({
        where: { id },
        data: { porcentajeAvance: dto.avance },
      });
    }

    return bitacora;
  }

  private assertPermisoProyecto(proyecto: Proyecto, usuario: UsuarioAutenticado) {
    if (usuario.rol === RolUsuario.admin) {
      return;
    }

    if (proyecto.usuarioId !== usuario.id) {
      throw new ForbiddenException('No tienes permiso para este proyecto.');
    }
  }

  private async recalcularAvanceProyecto(proyectoId: number) {
    const tareas = await this.prisma.tareaProyecto.findMany({ where: { proyectoId } });
    if (tareas.length === 0) {
      await this.prisma.proyecto.update({ where: { id: proyectoId }, data: { porcentajeAvance: 0 } });
      return;
    }

    const promedio = Math.round(
      tareas.reduce((acc, tarea) => acc + (tarea.progreso ?? 0), 0) / tareas.length,
    );

    await this.prisma.proyecto.update({ where: { id: proyectoId }, data: { porcentajeAvance: promedio } });
  }

  private mapearProyectoSalida(
    proyecto: Proyecto & {
      tareas?: Array<{
        id: number;
        titulo: string;
        descripcion: string | null;
        progreso: number;
        fechaEstimada: Date | null;
        fechaReal: Date | null;
      }>;
    },
  ) {
    return {
      id: proyecto.id,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      cliente: proyecto.cliente,
      estado: proyecto.estado,
      porcentajeAvance: proyecto.porcentajeAvance,
      fechaInicio: proyecto.fechaInicio,
      fechaFinEstimada: proyecto.fechaFinEstimada,
      gerente: proyecto.gerente,
      presupuesto: proyecto.presupuesto,
      hitos: (proyecto.tareas ?? []).map((tarea) => ({
        id: tarea.id,
        nombre: tarea.titulo,
        descripcion: tarea.descripcion ?? '',
        porcentajeAvance: tarea.progreso,
        fechaEstimada: tarea.fechaEstimada ?? proyecto.fechaFinEstimada,
        fechaReal: tarea.fechaReal,
      })),
    };
  }
}
