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
  private readonly authServicio = inject(AuthServicio);

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

  descargarXml(): void {
    const cotizacion = this.cotizacion();
    if (!cotizacion) return;

    const iva = 0.16;
    const subtotalBase = cotizacion.items.reduce((acc, item) => acc + item.subtotal, 0);
    const importeIva = parseFloat((subtotalBase * iva).toFixed(2));
    const totalFactura = parseFloat((subtotalBase + importeIva).toFixed(2));

    const esc = (texto: string) =>
      String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const articulos = cotizacion.items
      .map(
        (item) => `    <articulo>\n      <id>${item.id ?? ''}</id>\n      <nombre>${esc(item.producto.nombre)}</nombre>\n      <cantidad>${item.cantidad}</cantidad>\n      <precioUnitario>${item.precioUnitario}</precioUnitario>\n      <subtotal>${item.subtotal}</subtotal>\n    </articulo>`,
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<cotizacion_factura>\n  <numero>${esc(cotizacion.numero)}</numero>\n  <fecha>${new Date(cotizacion.fechaCreacion).toISOString()}</fecha>\n  <emisor>\n    <rfc>CYA123456789</rfc>\n    <razonSocial>CYACO ERP Soluciones S.A. de C.V.</razonSocial>\n    <direccionFiscal>Blvd. Tecnol\u00f3gico 456, C.P. 45000</direccionFiscal>\n  </emisor>\n  <receptor>\n    <rfc>N/A</rfc>\n    <razonSocial>${esc(cotizacion.contacto?.empresa ?? 'N/A')}</razonSocial>\n    <direccionFiscal>N/A</direccionFiscal>\n    <contactoEmail>${esc(cotizacion.contacto?.correo ?? '')}</contactoEmail>\n  </receptor>\n  <detalles_proyecto>\n    <nombre>${esc(cotizacion.proyecto?.nombre ?? 'Sin proyecto')}</nombre>\n    <fechaRequerida>${cotizacion.proyecto?.fechaRequerida ?? ''}</fechaRequerida>\n    <notas>${esc(cotizacion.observaciones ?? '')}</notas>\n  </detalles_proyecto>\n  <articulos>\n${articulos}\n  </articulos>\n  <totales>\n    <subtotal>${subtotalBase.toFixed(2)}</subtotal>\n    <tasaIVA>16%</tasaIVA>\n    <importeIVA>${importeIva.toFixed(2)}</importeIVA>\n    <totalFactura>${totalFactura.toFixed(2)}</totalFactura>\n  </totales>\n</cotizacion_factura>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `factura-cotizacion-${cotizacion.numero}.xml`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }

  descargarPdf(): void {
    const cotizacion = this.cotizacion();
    if (!cotizacion) return;
    if (!this.authServicio.estáAutenticado()) {
      this.cargando.set(false);
      window.alert('Debes iniciar sesión para enviar la cotización por correo.');
      return;
    }

    this.cargando.set(true);
    this.cotizacionServicio.enviarPorCorreoPdf(cotizacion.id).subscribe({
      next: () => {
        this.cargando.set(false);
        window.alert('La cotización fue enviada a tu correo con el PDF adjunto.');
      },
      error: (err) => {
        this.cargando.set(false);
        console.error(err);
        window.alert('Ocurrió un error al enviar la cotización por correo.');
      },
    });
  }
}
