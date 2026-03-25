import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CotizacionServicio } from '../../services/cotizacion.servicio';
import { Cotizacion } from '../../models/cotizacion.modelo';

type EstadoFiltro = 'todos' | 'pendiente' | 'en-proceso' | 'atendido' | 'rechazado';

interface FiltroEstado {
  id: EstadoFiltro;
  label: string;
}

interface CotizacionFila {
  id: number;
  numero: string;
  fecha: Date;
  cliente: string;
  contacto: string;
  items: number;
  total: number;
  estadoFiltro: Exclude<EstadoFiltro, 'todos'>;
  estadoLabel: 'Pendiente' | 'En Proceso' | 'Atendido' | 'Rechazado';
}

@Component({
  selector: 'app-lista-cotizaciones',
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-cotizaciones.componente.html',
  styleUrl: './lista-cotizaciones.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaCotizacionesComponente implements OnInit {
  readonly cotizaciones = signal<CotizacionFila[]>([]);
  readonly cargando = signal(true);
  readonly conError = signal(false);
  readonly terminoBusqueda = signal('');
  readonly filtroActivo = signal<EstadoFiltro>('todos');

  readonly filtros = signal<FiltroEstado[]>([
    { id: 'todos', label: 'Todos' },
    { id: 'pendiente', label: 'Pendiente' },
    { id: 'en-proceso', label: 'En Proceso' },
    { id: 'atendido', label: 'Atendido' },
    { id: 'rechazado', label: 'Rechazado' },
  ]);

  readonly cotizacionesFiltradas = computed(() => {
    const termino = this.terminoBusqueda().trim().toLowerCase();
    const filtro = this.filtroActivo();

    return this.cotizaciones().filter((cotizacion) => {
      const coincideTexto =
        !termino ||
        cotizacion.numero.toLowerCase().includes(termino) ||
        cotizacion.cliente.toLowerCase().includes(termino) ||
        cotizacion.contacto.toLowerCase().includes(termino);

      const coincideEstado = filtro === 'todos' || cotizacion.estadoFiltro === filtro;

      return coincideTexto && coincideEstado;
    });
  });

  private readonly cotizacionServicio = inject(CotizacionServicio);

  ngOnInit(): void {
    this.cargarCotizaciones();
  }

  cargarCotizaciones(): void {
    this.cotizacionServicio.obtenerTodas().subscribe({
      next: (datos: Cotizacion[]) => {
        this.cotizaciones.set((datos || []).map((cotizacion) => this.mapearCotizacion(cotizacion)));
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.conError.set(true);
      },
    });
  }

  actualizarBusqueda(value: string): void {
    this.terminoBusqueda.set(value);
  }

  seleccionarFiltro(id: EstadoFiltro): void {
    this.filtroActivo.set(id);
  }

  claseEstado(estado: CotizacionFila['estadoFiltro']): string {
    if (estado === 'atendido') {
      return 'estado-atendido';
    }

    if (estado === 'rechazado') {
      return 'estado-rechazado';
    }

    if (estado === 'en-proceso') {
      return 'estado-en-proceso';
    }

    return 'estado-pendiente';
  }

  formatDate(fecha: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(fecha));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(price);
  }

  trackById(_: number, cotizacion: CotizacionFila): number {
    return cotizacion.id;
  }

  private mapearCotizacion(cotizacion: Cotizacion): CotizacionFila {
    const estadoFiltro = this.normalizarEstado(cotizacion.estado);
    const estadoLabel = this.labelEstado(estadoFiltro);

    return {
      id: cotizacion.id,
      numero: cotizacion.numero,
      fecha: new Date(cotizacion.fechaCreacion),
      cliente: cotizacion.contacto?.empresa || 'Cliente sin empresa',
      contacto: cotizacion.contacto?.nombreCompleto || 'Sin contacto',
      items: cotizacion.items.length,
      total: cotizacion.total,
      estadoFiltro,
      estadoLabel,
    };
  }

  private normalizarEstado(estado: Cotizacion['estado']): Exclude<EstadoFiltro, 'todos'> {
    if (estado === 'aceptada') {
      return 'atendido';
    }

    if (estado === 'rechazada' || estado === 'cancelada') {
      return 'rechazado';
    }

    if (estado === 'borrador') {
      return 'en-proceso';
    }

    return 'pendiente';
  }

  private labelEstado(
    estado: Exclude<EstadoFiltro, 'todos'>,
  ): 'Pendiente' | 'En Proceso' | 'Atendido' | 'Rechazado' {
    if (estado === 'atendido') {
      return 'Atendido';
    }

    if (estado === 'rechazado') {
      return 'Rechazado';
    }

    if (estado === 'en-proceso') {
      return 'En Proceso';
    }

    return 'Pendiente';
  }
}
