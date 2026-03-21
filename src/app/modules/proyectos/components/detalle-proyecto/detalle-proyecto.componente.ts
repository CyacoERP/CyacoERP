import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProyectoServicio } from '../../services/proyecto.servicio';
import { Hito, Proyecto } from '../../models/proyecto.modelo';

type EstadoHitoVista = 'completado' | 'en_proceso' | 'pendiente';

interface HitoVista {
  id: number;
  nombre: string;
  fechaTexto: string;
  progreso: number;
  estado: EstadoHitoVista;
  estadoLabel: string;
}

interface Integrante {
  nombre: string;
  rol: string;
}

interface ProyectoDetalleVista {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  cliente: string;
  estado: Proyecto['estado'];
  estadoLabel: string;
  gerente: string;
  fechaInicio: Date;
  fechaFinEstimada: Date;
  presupuesto: number;
  porcentajeAvance: number;
  hitos: HitoVista[];
  equipo: Integrante[];
}

@Component({
  selector: 'app-detalle-proyecto',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-proyecto.componente.html',
  styleUrl: './detalle-proyecto.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleProyectoComponente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly proyectoServicio = inject(ProyectoServicio);

  readonly cargando = signal(true);
  readonly proyecto = signal<ProyectoDetalleVista | null>(null);

  readonly resumenHitos = computed(() => {
    const detalle = this.proyecto();
    if (!detalle) {
      return { completados: 0, enProceso: 0, pendientes: 0 };
    }

    return {
      completados: detalle.hitos.filter((hito) => hito.estado === 'completado').length,
      enProceso: detalle.hitos.filter((hito) => hito.estado === 'en_proceso').length,
      pendientes: detalle.hitos.filter((hito) => hito.estado === 'pendiente').length,
    };
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id) || id <= 0) {
      this.proyecto.set(this.crearDemo(1));
      this.cargando.set(false);
      return;
    }

    this.proyectoServicio.obtenerPorId(id).subscribe({
      next: (proyecto) => {
        this.proyecto.set(this.mapearDetalle(proyecto));
        this.cargando.set(false);
      },
      error: () => {
        this.proyecto.set(this.crearDemo(id));
        this.cargando.set(false);
      },
    });
  }

  private mapearDetalle(proyecto: Proyecto): ProyectoDetalleVista {
    const hitos = (proyecto.hitos ?? []).map((hito) => this.mapearHito(hito));

    return {
      id: proyecto.id,
      codigo: `PROJ-${String(proyecto.id).padStart(3, '0')}`,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      cliente: proyecto.cliente,
      estado: proyecto.estado,
      estadoLabel: this.obtenerEtiquetaEstado(proyecto.estado),
      gerente: proyecto.gerente ?? 'Ing. Carlos Vega',
      fechaInicio: new Date(proyecto.fechaInicio),
      fechaFinEstimada: new Date(proyecto.fechaFinEstimada),
      presupuesto: proyecto.presupuesto ?? 0,
      porcentajeAvance: proyecto.porcentajeAvance,
      hitos: hitos.length > 0 ? hitos : this.hitosDemo(),
      equipo: [
        { nombre: proyecto.gerente ?? 'Ing. Carlos Vega', rol: 'Gerente de Proyecto' },
        { nombre: 'Ing. Patricia Morales', rol: 'Ingeniera de Instrumentacion' },
        { nombre: 'Tec. Juan Perez', rol: 'Tecnico de Campo' },
      ],
    };
  }

  private mapearHito(hito: Hito): HitoVista {
    const progreso = hito.porcentajeAvance ?? 0;
    const estado: EstadoHitoVista =
      progreso >= 100 ? 'completado' : progreso > 0 ? 'en_proceso' : 'pendiente';

    return {
      id: hito.id,
      nombre: hito.nombre,
      fechaTexto: this.formatearFecha(hito.fechaEstimada),
      progreso,
      estado,
      estadoLabel:
        estado === 'completado'
          ? 'Completado'
          : estado === 'en_proceso'
            ? 'En Proceso'
            : 'Pendiente',
    };
  }

  private obtenerEtiquetaEstado(estado: Proyecto['estado']): string {
    switch (estado) {
      case 'en_progreso':
        return 'En Proceso';
      case 'finalizado':
        return 'Completado';
      case 'planificacion':
        return 'Pendiente';
      case 'pausado':
        return 'Pausado';
      default:
        return 'N/D';
    }
  }

  private formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(fecha));
  }

  private crearDemo(id: number): ProyectoDetalleVista {
    return {
      id,
      codigo: 'PROJ-001',
      nombre: 'Modernizacion Sistema SCADA - Refineria Cadereyta',
      descripcion:
        'Modernizacion completa del sistema de control y supervision de la refineria, sustituyendo equipos obsoletos por instrumentacion Endress+Hauser de ultima generacion.',
      cliente: 'PEMEX Refinacion',
      estado: 'en_progreso',
      estadoLabel: 'En Proceso',
      gerente: 'Ing. Carlos Vega',
      fechaInicio: new Date('2024-08-31'),
      fechaFinEstimada: new Date('2025-03-30'),
      presupuesto: 2500000,
      porcentajeAvance: 65,
      hitos: this.hitosDemo(),
      equipo: [
        { nombre: 'Ing. Carlos Vega', rol: 'Gerente de Proyecto' },
        { nombre: 'Ing. Patricia Morales', rol: 'Ingeniera de Instrumentacion' },
        { nombre: 'Tec. Juan Perez', rol: 'Tecnico de Campo' },
      ],
    };
  }

  private hitosDemo(): HitoVista[] {
    return [
      {
        id: 1,
        nombre: 'Ingenieria Basica y FEED',
        fechaTexto: '29 de septiembre de 2024',
        progreso: 100,
        estado: 'completado',
        estadoLabel: 'Completado',
      },
      {
        id: 2,
        nombre: 'Suministro de Instrumentacion',
        fechaTexto: '29 de noviembre de 2024',
        progreso: 100,
        estado: 'completado',
        estadoLabel: 'Completado',
      },
      {
        id: 3,
        nombre: 'Instalacion y Cableado',
        fechaTexto: '30 de enero de 2025',
        progreso: 70,
        estado: 'en_proceso',
        estadoLabel: 'En Proceso',
      },
      {
        id: 4,
        nombre: 'Programacion SCADA/DCS',
        fechaTexto: '27 de febrero de 2025',
        progreso: 45,
        estado: 'en_proceso',
        estadoLabel: 'En Proceso',
      },
      {
        id: 5,
        nombre: 'Pruebas FAT/SAT',
        fechaTexto: '14 de marzo de 2025',
        progreso: 0,
        estado: 'pendiente',
        estadoLabel: 'Pendiente',
      },
      {
        id: 6,
        nombre: 'Puesta en Marcha',
        fechaTexto: '30 de marzo de 2025',
        progreso: 0,
        estado: 'pendiente',
        estadoLabel: 'Pendiente',
      },
    ];
  }
}
