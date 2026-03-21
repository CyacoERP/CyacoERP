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

    const contenido = [
      `Cotizacion: ${cotizacion.numero}`,
      `Cliente: ${cotizacion.contacto?.empresa ?? 'N/A'}`,
      `Contacto: ${cotizacion.contacto?.nombreCompleto ?? 'N/A'}`,
      `Total: ${this.formatPrice(cotizacion.total)}`,
    ].join('\n');

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cotizacion.numero}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
