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
import { AuthServicio } from '../../../auth/services/auth.servicio';
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
  readonly cargandoEditorId = signal<number | null>(null);
  readonly guardandoPreciosId = signal<number | null>(null);
  readonly errorAccion = signal('');
  readonly mostrandoEditorPrecios = signal(false);
  readonly cotizacionEdicion = signal<Cotizacion | null>(null);
  readonly descuentoEdicion = signal(0);
  readonly margenEdicion = signal(0);
  readonly preciosEditados = signal<Record<number, number>>({});

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
  private readonly authServicio = inject(AuthServicio);
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
    this.errorAccion.set('');
    this.actualizandoEstadoId.set(cotizacion.id);
    this.cotizacionServicio.actualizarEstado(cotizacion.id, estado).subscribe({
      next: () => {
        this.actualizandoEstadoId.set(null);
        this.cargarCotizaciones();
      },
      error: (error) => {
        this.errorAccion.set(this.obtenerMensajeError(error, 'No se pudo actualizar el estado de la cotización.'));
        this.actualizandoEstadoId.set(null);
      },
    });
  }

  abrirEditorPrecios(cotizacion: CotizacionFila): void {
    this.errorAccion.set('');
    this.cargandoEditorId.set(cotizacion.id);
    this.cotizacionServicio.obtenerPorId(cotizacion.id).subscribe({
      next: (detalle) => {
        this.cargandoEditorId.set(null);
        this.cotizacionEdicion.set(detalle);
        this.descuentoEdicion.set(0);
        this.margenEdicion.set(0);
        this.preciosEditados.set(
          detalle.items.reduce<Record<number, number>>((acc, item) => {
            if (item.id) {
              acc[item.id] = item.precioUnitario;
            }
            return acc;
          }, {}),
        );
        this.mostrandoEditorPrecios.set(true);
      },
      error: (error) => {
        this.cargandoEditorId.set(null);
        this.errorAccion.set(this.obtenerMensajeError(error, 'No se pudo cargar el detalle para editar precios.'));
      },
    });
  }

  cerrarEditorPrecios(): void {
    this.mostrandoEditorPrecios.set(false);
    this.cotizacionEdicion.set(null);
    this.preciosEditados.set({});
  }

  actualizarPrecioEditado(itemId: number | undefined, valor: string): void {
    if (!itemId) {
      return;
    }
    const numero = Number(valor);
    this.preciosEditados.update((actual) => ({
      ...actual,
      [itemId]: Number.isNaN(numero) ? 0 : numero,
    }));
  }

  guardarEdicionPrecios(): void {
    const cotizacion = this.cotizacionEdicion();
    if (!cotizacion) {
      return;
    }

    this.errorAccion.set('');
    this.guardandoPreciosId.set(cotizacion.id);

    const items = cotizacion.items
      .map((item) => {
        if (!item.id) {
          return null;
        }
        const precioUnitario = this.preciosEditados()[item.id] ?? item.precioUnitario;
        return {
          itemId: item.id,
          precioUnitario,
        };
      })
      .filter((item): item is { itemId: number; precioUnitario: number } => item !== null);

    this.cotizacionServicio
      .actualizarPrecios(cotizacion.id, {
        descuentoPct: this.descuentoEdicion(),
        margenPct: this.margenEdicion(),
        items,
      })
      .subscribe({
        next: () => {
          this.guardandoPreciosId.set(null);
          this.cerrarEditorPrecios();
          this.cargarCotizaciones();
        },
        error: (error) => {
          this.guardandoPreciosId.set(null);
          this.errorAccion.set(this.obtenerMensajeError(error, 'No se pudo actualizar precios de la cotización.'));
        },
      });
  }

  descargarResumenPdf(cotizacion: CotizacionFila): void {
    this.errorAccion.set('');
    this.cargandoEditorId.set(cotizacion.id);

    if (!this.authServicio.estáAutenticado()) {
      this.cargandoEditorId.set(null);
      this.errorAccion.set('Debes iniciar sesión para enviar la cotización por correo.');
      // Opcional: redirigir a login
      // this.router.navigate(['/auth/login']);
      return;
    }

    this.cotizacionServicio.enviarPorCorreoPdf(cotizacion.id).subscribe({
      next: () => {
        this.cargandoEditorId.set(null);
        window.alert('La cotización fue enviada a tu correo con el PDF adjunto.');
      },
      error: (error) => {
        this.cargandoEditorId.set(null);
        this.errorAccion.set(this.obtenerMensajeError(error, 'No se pudo enviar la cotización por correo.'));
      },
    });
  }

  private abrirVentanaPdf(cotizacion: CotizacionFila, detalle: Cotizacion): void {
    const ahora = new Date();
    const hora = ahora.toTimeString().split(' ')[0];

    const filas = detalle.items
      .map(
        (item, i) => `<tr>
          <td>${i + 1}</td>
          <td>${item.id ?? '—'}</td>
          <td>${item.producto.nombre}<br/><span style="color:#6b7280;font-size:8px">${(item.producto as { categoria?: { nombre?: string } }).categoria?.nombre ?? 'Sin categoría'}</span></td>
          <td style="text-align:center">${item.cantidad}</td>
          <td style="text-align:right">${this.formatPrice(item.precioUnitario)}</td>
          <td style="text-align:right">${this.formatPrice(item.precioUnitario * item.cantidad)}</td>
        </tr>`,
      )
      .join('');

    const contenido = `<!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>${cotizacion.numero}</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 10mm; font-size: 11px; color: #1f2937; }
            h1 { margin: 0 0 4px; font-size: 17px; color: #13295b; }
            .brand { font-weight: bold; color: #13295b; font-size: 11px; }
            .meta { margin: 2px 0; color: #4b5563; font-size: 9px; }
            header { display: flex; justify-content: space-between; padding-bottom: 6px; border-bottom: 2px solid #13295b; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9px; }
            th { background: #f3f4f6; padding: 4px; border-bottom: 1px solid #dbe2ea; font-size: 8px; text-transform: uppercase; text-align: left; }
            td { padding: 4px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
            .total { text-align: right; font-size: 13px; font-weight: bold; color: #13295b; margin-top: 8px; }
            .footer { text-align: center; font-size: 7px; color: #9ca3af; margin-top: 10px; }
          </style>
        </head>
        <body>
          <header>
            <div>
              <div class="brand">Cyaco ERP</div>
              <h1>Cotización ${cotizacion.numero}</h1>
              <p class="meta">Estado: ${cotizacion.estadoLabel}</p>
            </div>
            <div style="text-align:right">
              <p class="meta"><strong>Cliente:</strong> ${cotizacion.cliente}</p>
              <p class="meta"><strong>Contacto:</strong> ${cotizacion.contacto}</p>
              <p class="meta"><strong>Fecha:</strong> ${this.formatDate(cotizacion.fecha)}</p>
              <p class="meta"><strong>Hora:</strong> ${hora}</p>
              <p class="meta"><strong>Moneda:</strong> MXN</p>
            </div>
          </header>
          <table>
            <thead>
              <tr>
                <th style="width:5%">#</th>
                <th style="width:7%">ID</th>
                <th style="width:43%">Producto / Categoría</th>
                <th style="width:8%;text-align:center">Cant.</th>
                <th style="width:18%;text-align:right">Precio U.</th>
                <th style="width:19%;text-align:right">Subtotal</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
          <div class="total">Total: ${this.formatPrice(cotizacion.total)}</div>
          <div class="footer">Cyaco ERP — ${cotizacion.numero} — Impreso: ${ahora.toLocaleDateString('es-MX')}</div>
        </body>
      </html>`;

    const blob = new Blob([contenido], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const ventana = window.open(url, '_blank');
    if (!ventana) {
      URL.revokeObjectURL(url);
      this.errorAccion.set('No se pudo abrir el PDF. Verifica si el navegador bloqueó la ventana.');
      return;
    }

    setTimeout(() => {
      ventana.focus();
      ventana.print();
    }, 600);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
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

  private obtenerMensajeError(error: unknown, fallback: string): string {
    const err = error as { error?: { message?: string | string[] } };
    const message = err?.error?.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
    return fallback;
  }
}
