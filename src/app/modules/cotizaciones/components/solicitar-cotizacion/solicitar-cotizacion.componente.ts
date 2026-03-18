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

  readonly itemsCarrito = this.carritoServicio.itemsCarrito;
  readonly totalEstimado = this.carritoServicio.totalPrecio;
  readonly totalItems = this.carritoServicio.totalItems;
  readonly sinItems = computed(() => this.itemsCarrito().length === 0);

  readonly formulario = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.minLength(8)]],
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
    if (this.formulario.invalid || this.sinItems()) {
      this.formulario.markAllAsTouched();
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

    this.cotizacionServicio.crearDesdeSolicitud(payload);
    this.carritoServicio.vaciarCarrito();
    this.enviado.set(true);
    this.router.navigate(['/cotizaciones/mis']);
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
}
