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
  estadoOriginal: Cotizacion['estado'];
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
  readonly fechaDesde = signal('');
  readonly fechaHasta = signal('');
  readonly esVistaAdmin = signal(false);
  readonly actualizandoEstadoId = signal<number | null>(null);

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
    const fechaDesde = this.fechaDesde();
    const fechaHasta = this.fechaHasta();
    const fechaDesdeDate = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null;
    const fechaHastaDate = fechaHasta ? new Date(`${fechaHasta}T23:59:59`) : null;

    return this.cotizaciones().filter((cotizacion) => {
      const coincideTexto =
        !termino ||
        cotizacion.numero.toLowerCase().includes(termino) ||
        cotizacion.cliente.toLowerCase().includes(termino) ||
        cotizacion.contacto.toLowerCase().includes(termino);

      const coincideEstado = filtro === 'todos' || cotizacion.estadoFiltro === filtro;

      const coincideFechaDesde = !fechaDesdeDate || cotizacion.fecha >= fechaDesdeDate;
      const coincideFechaHasta = !fechaHastaDate || cotizacion.fecha <= fechaHastaDate;

      return coincideTexto && coincideEstado && coincideFechaDesde && coincideFechaHasta;
    });
  });

  private readonly cotizacionServicio = inject(CotizacionServicio);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.esVistaAdmin.set(this.route.snapshot.routeConfig?.path === 'admin/cotizaciones');
    this.cargarCotizaciones();
  }

  cargarCotizaciones(): void {
    this.cargando.set(true);
    this.conError.set(false);

    const peticion = this.esVistaAdmin()
      ? this.cotizacionServicio.obtenerParaAdmin({
          desde: this.fechaDesde() || undefined,
          hasta: this.fechaHasta() || undefined,
        })
      : this.cotizacionServicio.obtenerTodas();

    peticion.subscribe({
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

  actualizarFechaDesde(value: string): void {
    this.fechaDesde.set(value);
    if (this.esVistaAdmin()) {
      this.cargarCotizaciones();
    }
  }

  actualizarFechaHasta(value: string): void {
    this.fechaHasta.set(value);
    if (this.esVistaAdmin()) {
      this.cargarCotizaciones();
    }
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

  actualizarEstado(cotizacion: CotizacionFila, estado: Cotizacion['estado']): void {
    this.actualizandoEstadoId.set(cotizacion.id);
    this.cotizacionServicio.actualizarEstado(cotizacion.id, estado).subscribe({
      next: () => {
        this.actualizandoEstadoId.set(null);
        this.cargarCotizaciones();
      },
      error: () => {
        this.actualizandoEstadoId.set(null);
      },
    });
  }

  descargarResumenPdf(cotizacion: CotizacionFila): void {
    const ventana = window.open('', '_blank', 'noopener,noreferrer,width=860,height=680');
    if (!ventana) {
      return;
    }

    const contenido = `<!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>${cotizacion.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #1f2937; }
            h1 { margin: 0 0 8px; }
            .meta { margin: 6px 0; color: #475569; }
            .card { margin-top: 18px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
            .total { font-size: 24px; font-weight: 700; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Cotizacion ${cotizacion.numero}</h1>
          <p class="meta">Cliente: ${cotizacion.cliente}</p>
          <p class="meta">Contacto: ${cotizacion.contacto}</p>
          <p class="meta">Fecha: ${this.formatDate(cotizacion.fecha)}</p>
          <p class="meta">Estado: ${cotizacion.estadoLabel}</p>

          <section class="card">
            <p>Items: ${cotizacion.items}</p>
            <p class="total">Total estimado: ${this.formatPrice(cotizacion.total)}</p>
          </section>
        </body>
      </html>`;

    ventana.document.open();
    ventana.document.write(contenido);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  puedeAprobar(cotizacion: CotizacionFila): boolean {
    return cotizacion.estadoOriginal !== 'aceptada';
  }

  puedeRechazar(cotizacion: CotizacionFila): boolean {
    return cotizacion.estadoOriginal !== 'rechazada' && cotizacion.estadoOriginal !== 'cancelada';
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
      estadoOriginal: cotizacion.estado,
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
