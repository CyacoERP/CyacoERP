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
        (item) => `    <articulo>
      <id>${item.id ?? ''}</id>
      <nombre>${esc(item.producto.nombre)}</nombre>
      <cantidad>${item.cantidad}</cantidad>
      <precioUnitario>${item.precioUnitario}</precioUnitario>
      <subtotal>${item.subtotal}</subtotal>
    </articulo>`,
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cotizacion_factura>
  <numero>${esc(cotizacion.numero)}</numero>
  <fecha>${new Date(cotizacion.fechaCreacion).toISOString()}</fecha>
  <emisor>
    <rfc>CYA123456789</rfc>
    <razonSocial>CYACO ERP Soluciones S.A. de C.V.</razonSocial>
    <direccionFiscal>Blvd. Tecnol\u00f3gico 456, C.P. 45000</direccionFiscal>
  </emisor>
  <receptor>
    <rfc>N/A</rfc>
    <razonSocial>${esc(cotizacion.contacto?.empresa ?? 'N/A')}</razonSocial>
    <direccionFiscal>N/A</direccionFiscal>
    <contactoEmail>${esc(cotizacion.contacto?.correo ?? '')}</contactoEmail>
  </receptor>
  <detalles_proyecto>
    <nombre>${esc(cotizacion.proyecto?.nombre ?? 'Sin proyecto')}</nombre>
    <fechaRequerida>${cotizacion.proyecto?.fechaRequerida ?? ''}</fechaRequerida>
    <notas>${esc(cotizacion.observaciones ?? '')}</notas>
  </detalles_proyecto>
  <articulos>
${articulos}
  </articulos>
  <totales>
    <subtotal>${subtotalBase.toFixed(2)}</subtotal>
    <tasaIVA>16%</tasaIVA>
    <importeIVA>${importeIva.toFixed(2)}</importeIVA>
    <totalFactura>${totalFactura.toFixed(2)}</totalFactura>
  </totales>
</cotizacion_factura>`;

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
    if (!cotizacion) {
      return;
    }

    const ahora = new Date();
    const fechaEmision = this.formatDate(cotizacion.fechaCreacion);
    const horaEmision = ahora.toTimeString().split(' ')[0];
    const fechaRequerida = cotizacion.proyecto?.fechaRequerida
      ? this.formatDate(new Date(cotizacion.proyecto.fechaRequerida))
      : 'N/A';

    const filas = cotizacion.items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.id ?? '—'}</td>
            <td>${item.producto.nombre}<br/><span class="cat">${item.producto.categoria?.nombre ?? 'Sin categoría'}</span></td>
            <td style="text-align:center">${item.cantidad}</td>
            <td style="text-align:right">${this.formatPrice(item.precioUnitario)}</td>
            <td style="text-align:right">${this.formatPrice(item.subtotal)}</td>
          </tr>`,
      )
      .join('');

    const subtotalPartidas = cotizacion.items.reduce((acc, item) => acc + item.subtotal, 0);
    const importeIva = parseFloat((subtotalPartidas * 0.16).toFixed(2));
    const totalConIva = parseFloat((subtotalPartidas + importeIva).toFixed(2));

    const contenido = `<!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>${cotizacion.numero}</title>
          <style>
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #1f2937;
              background: #ffffff;
            }
            body {
              width: 210mm;
              margin: 0;
              padding: 8mm;
              font-size: 11px;
              line-height: 1.25;
            }
            .page {
              width: 100%;
              margin: 0 auto;
              max-width: 194mm;
            }
            header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
              margin-bottom: 8px;
              padding-bottom: 6px;
              border-bottom: 2px solid #13295b;
            }
            h1 {
              margin: 0 0 4px;
              font-size: 18px;
              line-height: 1.05;
              color: #13295b;
            }
            .brand {
              font-size: 11px;
              font-weight: bold;
              color: #13295b;
            }
            .meta {
              margin: 0 0 2px;
              color: #4b5563;
              font-size: 9px;
            }
            .parties-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              margin-bottom: 6px;
            }
            .party-block {
              border: 1px solid #dbe2ea;
              border-radius: 4px;
              padding: 6px 8px;
              background: #f8fafc;
            }
            .party-block .section-title {
              display: block;
              margin-bottom: 4px;
              color: #0f2755;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #dbe2ea;
              padding-bottom: 2px;
            }
            .project-block {
              border: 1px solid #dbe2ea;
              border-radius: 4px;
              padding: 6px 8px;
              background: #f0f4ff;
              margin-bottom: 6px;
            }
            .project-block .section-title {
              display: block;
              margin-bottom: 4px;
              color: #0f2755;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 6px 0;
              font-size: 9px;
            }
            th {
              background: #f3f4f6;
              color: #374151;
              font-weight: bold;
              text-align: left;
              padding: 4px;
              border-bottom: 1px solid #dbe2ea;
              font-size: 8px;
              text-transform: uppercase;
            }
            td {
              padding: 4px;
              border-bottom: 1px solid #e5e7eb;
              vertical-align: top;
            }
            .cat {
              color: #6b7280;
              font-size: 8px;
            }
            .totals-block {
              margin-top: 6px;
              display: flex;
              justify-content: flex-end;
            }
            .totals-table {
              width: 220px;
              font-size: 9px;
            }
            .totals-table td {
              padding: 2px 4px;
              border: none;
              border-bottom: 1px solid #e5e7eb;
            }
            .totals-table .total-final td {
              font-weight: bold;
              font-size: 11px;
              color: #13295b;
              border-top: 2px solid #13295b;
              border-bottom: none;
            }
            .notes {
              margin-top: 6px;
              padding: 6px 8px;
              border-left: 3px solid #f59e0b;
              background: #fffaf0;
              border-radius: 3px;
              font-size: 8px;
            }
            .notes p { margin: 2px 0; }
            .footer-info {
              margin-top: 6px;
              text-align: center;
              font-size: 7px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <header>
              <div>
                <div class="brand">Cyaco ERP — TECNOLOGÍA INDUSTRIAL</div>
                <h1>Cotización ${cotizacion.numero}</h1>
                <p class="meta">Estado: <strong>${this.estadoBadge()}</strong> &nbsp;|&nbsp; Partidas: ${cotizacion.items.length}</p>
              </div>
              <div style="text-align: right;">
                <p class="meta"><strong>Fecha emisión:</strong> ${fechaEmision}</p>
                <p class="meta"><strong>Hora:</strong> ${horaEmision}</p>
                <p class="meta"><strong>Moneda:</strong> MXN</p>
              </div>
            </header>

            <div class="parties-grid">
              <div class="party-block">
                <span class="section-title">Emisor</span>
                <p class="meta"><strong>Razón social:</strong> CYACO ERP Soluciones S.A. de C.V.</p>
                <p class="meta"><strong>RFC:</strong> CYA123456789</p>
                <p class="meta"><strong>Dirección fiscal:</strong> Blvd. Tecnológico 456, C.P. 45000</p>
              </div>
              <div class="party-block">
                <span class="section-title">Receptor</span>
                <p class="meta"><strong>Empresa:</strong> ${cotizacion.contacto?.empresa ?? 'N/A'}</p>
                <p class="meta"><strong>Contacto:</strong> ${cotizacion.contacto?.nombreCompleto ?? 'N/A'}</p>
                <p class="meta"><strong>Cargo:</strong> ${cotizacion.contacto?.cargo ?? 'N/A'}</p>
                <p class="meta"><strong>Correo:</strong> ${cotizacion.contacto?.correo ?? 'N/A'}</p>
                <p class="meta"><strong>Teléfono:</strong> ${cotizacion.contacto?.telefono ?? 'N/A'}</p>
              </div>
            </div>

            <div class="project-block">
              <span class="section-title">Detalles del Proyecto</span>
              <p class="meta"><strong>Proyecto:</strong> ${cotizacion.proyecto?.nombre ?? 'Sin proyecto'}</p>
              <p class="meta"><strong>Fecha requerida:</strong> ${fechaRequerida}</p>
              <p class="meta"><strong>Observaciones:</strong> ${cotizacion.observaciones ?? 'Sin observaciones.'}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 5%">#</th>
                  <th style="width: 7%">ID</th>
                  <th style="width: 41%">Producto / Categoría</th>
                  <th style="width: 8%; text-align: center;">Cant.</th>
                  <th style="width: 19%; text-align: right;">Precio U.</th>
                  <th style="width: 20%; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${filas}</tbody>
            </table>

            <div class="totals-block">
              <table class="totals-table">
                <tbody>
                  <tr>
                    <td>Subtotal</td>
                    <td style="text-align:right">${this.formatPrice(subtotalPartidas)}</td>
                  </tr>
                  <tr>
                    <td>IVA (16%)</td>
                    <td style="text-align:right">${this.formatPrice(importeIva)}</td>
                  </tr>
                  <tr class="total-final">
                    <td>Total</td>
                    <td style="text-align:right">${this.formatPrice(totalConIva)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <section class="notes">
              <p>* Los precios mostrados son referenciales y no incluyen instalación ni flete salvo indicación expresa.</p>
              <p>* El precio final será confirmado en propuesta formal firmada por ambas partes.</p>
            </section>

            <div class="footer-info">
              <p>Cyaco ERP Soluciones S.A. de C.V. — RFC: CYA123456789 &nbsp;|&nbsp; ${cotizacion.numero} &nbsp;|&nbsp; Impreso: ${new Date().toLocaleDateString('es-MX')}</p>
            </div>
          </div>
        </body>
      </html>`;

    const blob = new Blob([contenido], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const ventana = window.open(url, '_blank');
    if (!ventana) {
      URL.revokeObjectURL(url);
      window.alert('No se pudo abrir la ventana de PDF. Verifica si tu navegador bloqueó el popup.');
      return;
    }

    setTimeout(() => {
      ventana.focus();
      ventana.print();
    }, 650);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
  }
}
