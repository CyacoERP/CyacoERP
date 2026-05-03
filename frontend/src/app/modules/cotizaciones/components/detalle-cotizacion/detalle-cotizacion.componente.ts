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

type EstadoTimeline = 'recibida' | 'revision' | 'proceso' | 'atendido';

@Component({
  selector: 'app-detalle-cotizacion',
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-cotizacion.componente.html',
  styleUrl: './detalle-cotizacion.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleCotizacionComponente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cotizacionServicio = inject(CotizacionServicio);

  readonly cargando = signal(true);
  readonly conError = signal(false);
  readonly cotizacion = signal<Cotizacion | null>(null);

  readonly estadoActual = computed<EstadoTimeline>(() => {
    const cotizacion = this.cotizacion();
    if (!cotizacion) {
      return 'recibida';
    }

    if (cotizacion.estado === 'aceptada') {
      return 'atendido';
    }

    if (cotizacion.estado === 'rechazada' || cotizacion.estado === 'cancelada') {
      return 'atendido';
    }

    if (cotizacion.estado === 'borrador') {
      return 'proceso';
    }

    return 'revision';
  });

  readonly pasoActivo = computed(() => {
    const estado = this.estadoActual();
    if (estado === 'atendido') {
      return 4;
    }

    if (estado === 'proceso') {
      return 3;
    }

    if (estado === 'revision') {
      return 2;
    }

    return 1;
  });

  readonly estadoBadge = computed(() => {
    const cotizacion = this.cotizacion();
    if (!cotizacion) {
      return 'Pendiente';
    }

    if (cotizacion.estado === 'aceptada') {
      return 'Atendido';
    }

    if (cotizacion.estado === 'rechazada' || cotizacion.estado === 'cancelada') {
      return 'Rechazado';
    }

    if (cotizacion.estado === 'borrador') {
      return 'En Proceso';
    }

    return 'Pendiente';
  });

  readonly totalItems = computed(() => this.cotizacion()?.items.length ?? 0);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const idRaw = params.get('id');
      const id = Number(idRaw);
      if (!idRaw || Number.isNaN(id) || id <= 0) {
        this.cargando.set(false);
        this.conError.set(true);
        return;
      }

      this.cargando.set(true);
      this.conError.set(false);
      this.cotizacionServicio.obtenerPorId(id).subscribe({
        next: (cotizacion) => {
          this.cotizacion.set(cotizacion);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.conError.set(true);
        },
      });
    });
  }

  formatDate(value: Date | undefined): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(value));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(price);
  }

  descargarPdf(): void {
    const cotizacion = this.cotizacion();
    if (!cotizacion) {
      return;
    }

    const ventana = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!ventana) {
      window.print();
      return;
    }

    const filas = cotizacion.items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.producto.nombre}</td>
            <td>${item.cantidad}</td>
            <td>${this.formatPrice(item.precioUnitario)}</td>
            <td>${this.formatPrice(item.subtotal)}</td>
          </tr>`,
      )
      .join('');

    const contenido = `<!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>${cotizacion.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
            header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
            h1 { margin: 0 0 8px; font-size: 28px; }
            .meta { margin: 0; color: #4b5563; }
            .summary { margin: 24px 0; padding: 16px; background: #f3f4f6; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border-bottom: 1px solid #e5e7eb; text-align: left; padding: 10px 8px; }
            th { color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
            .total { margin-top: 20px; text-align: right; font-size: 20px; font-weight: 700; }
            .notes { margin-top: 24px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <header>
            <div>
              <h1>Cotizacion ${cotizacion.numero}</h1>
              <p class="meta">Empresa: ${cotizacion.contacto?.empresa ?? 'N/A'}</p>
              <p class="meta">Contacto: ${cotizacion.contacto?.nombreCompleto ?? 'N/A'}</p>
              <p class="meta">Fecha: ${this.formatDate(cotizacion.fechaCreacion)}</p>
            </div>
            <div>
              <p class="meta">Estado: ${this.estadoBadge()}</p>
              <p class="meta">Proyecto: ${cotizacion.proyecto?.nombre ?? 'Sin proyecto'}</p>
            </div>
          </header>

          <section class="summary">
            <strong>Resumen</strong>
            <p class="meta">Total de partidas: ${cotizacion.items.length}</p>
            <p class="meta">Fecha requerida: ${cotizacion.proyecto?.fechaRequerida ?? 'N/A'}</p>
          </section>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>

          <div class="total">Total: ${this.formatPrice(cotizacion.total)}</div>

          <section class="notes">
            <strong>Observaciones</strong>
            <p>${cotizacion.observaciones ?? 'Sin observaciones.'}</p>
          </section>
        </body>
      </html>`;

    ventana.document.open();
    ventana.document.write(contenido);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }
}
