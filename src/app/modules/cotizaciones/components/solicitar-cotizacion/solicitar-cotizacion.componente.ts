import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CarritoServicio } from '../../../catalogo/services/carrito.servicio';
import { CotizacionServicio } from '../../services/cotizacion.servicio';
import { ItemCotizacion, SolicitudCotizacion } from '../../models/cotizacion.modelo';

@Component({
  selector: 'app-solicitar-cotizacion',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './solicitar-cotizacion.componente.html',
  styleUrl: './solicitar-cotizacion.componente.css',
})
export class SolicitarCotizacionComponente {
  private readonly fb = inject(FormBuilder);
  private readonly carritoServicio = inject(CarritoServicio);
  private readonly cotizacionServicio = inject(CotizacionServicio);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly mensajeSinCotizaciones = signal(false);
  readonly enviado = signal(false);
  readonly mensajeEnvio = signal<string | null>(null);

  readonly itemsCarrito = this.carritoServicio.itemsCarrito;
  readonly totalEstimado = this.carritoServicio.totalPrecio;
  readonly totalItems = this.carritoServicio.totalItems;
  readonly sinItems = computed(() => this.itemsCarrito().length === 0);

  readonly formulario = this.fb.group({
    nombreCompleto: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required]],
    cargo: [''],
    empresa: ['', Validators.required],
    proyecto: ['', Validators.required],
    fechaRequerida: ['', Validators.required],
    notas: [''],
    aceptaPrivacidad: [false, Validators.requiredTrue],
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.mensajeSinCotizaciones.set(params.get('empty') === '1');
    });
  }

  enviarSolicitud(): void {
    this.mensajeEnvio.set(null);

    if (this.sinItems()) {
      this.mensajeEnvio.set('No hay productos en la cotización. Agrega al menos un artículo para continuar.');
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensajeEnvio.set('Completa los campos obligatorios y acepta el aviso de privacidad para continuar.');
      return;
    }

    const value = this.formulario.getRawValue();
    const items: ItemCotizacion[] = this.itemsCarrito().map((item) => ({
      producto: item.producto,
      cantidad: item.cantidad,
      precioUnitario: item.producto.price,
      subtotal: item.producto.price * item.cantidad,
    }));

    const payload: SolicitudCotizacion = {
      nombreCompleto: value.nombreCompleto ?? '',
      correo: value.correo ?? '',
      telefono: value.telefono ?? '',
      cargo: value.cargo ?? '',
      empresa: value.empresa ?? '',
      proyecto: value.proyecto ?? '',
      fechaRequerida: value.fechaRequerida ?? '',
      notas: value.notas ?? '',
      items,
    };

    const cotizacionCreada = this.cotizacionServicio.crearDesdeSolicitud(payload);
    this.descargarXmlCotizacion(cotizacionCreada.numero, payload);
    this.enviado.set(true);

    // Espera breve para que el navegador inicie la descarga antes de redirigir.
    setTimeout(() => {
      this.carritoServicio.vaciarCarrito();
      this.router.navigate(['/cotizaciones/mis']);
    }, 500);
  }

  private descargarXmlCotizacion(numeroCotizacion: string, payload: SolicitudCotizacion): void {
    const total = payload.items.reduce((acc, item) => acc + item.subtotal, 0);
    const fecha = new Date().toISOString();

    const itemsXml = payload.items
      .map((item) => `
    <articulo>
      <id>${this.escapeXml(String(item.producto.id))}</id>
      <nombre>${this.escapeXml(item.producto.name)}</nombre>
      <cantidad>${item.cantidad}</cantidad>
      <precioUnitario>${item.precioUnitario}</precioUnitario>
      <subtotal>${item.subtotal}</subtotal>
    </articulo>`)
      .join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cotizacion>
  <numero>${this.escapeXml(numeroCotizacion)}</numero>
  <fecha>${fecha}</fecha>
  <contacto>
    <nombreCompleto>${this.escapeXml(payload.nombreCompleto)}</nombreCompleto>
    <correo>${this.escapeXml(payload.correo)}</correo>
    <telefono>${this.escapeXml(payload.telefono)}</telefono>
    <cargo>${this.escapeXml(payload.cargo)}</cargo>
    <empresa>${this.escapeXml(payload.empresa)}</empresa>
  </contacto>
  <proyecto>
    <nombre>${this.escapeXml(payload.proyecto)}</nombre>
    <fechaRequerida>${this.escapeXml(payload.fechaRequerida)}</fechaRequerida>
    <notas>${this.escapeXml(payload.notas)}</notas>
  </proyecto>
  <articulos>${itemsXml}
  </articulos>
  <total>${total}</total>
</cotizacion>`;

    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotizacion-${numeroCotizacion}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(price);
  }

  invalid(controlName: string): boolean {
    const control = this.formulario.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  puedeEnviar(): boolean {
    return this.formulario.valid && !this.sinItems();
  }
}
