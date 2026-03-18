import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { CotizacionServicio } from '../../services/cotizacion.servicio';
import { Cotizacion } from '../../models/cotizacion.modelo';

@Component({
  selector: 'app-lista-cotizaciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-cotizaciones.componente.html',
  styleUrl: './lista-cotizaciones.componente.css',
})
export class ListaCotizacionesComponente implements OnInit {
  cotizaciones = signal<Cotizacion[]>([]);
  cargando = signal(true);

  private readonly cotizacionServicio = inject(CotizacionServicio);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.cargarCotizaciones();
  }

  cargarCotizaciones(): void {
    this.cotizacionServicio.obtenerTodas().subscribe({
      next: (datos: Cotizacion[]) => {
        this.cotizaciones.set(datos || []);
        this.cargando.set(false);

        if ((datos || []).length === 0) {
          this.router.navigate(['/cotizaciones/solicitar'], {
            queryParams: { empty: '1' },
          });
        }
      },
      error: () => {
        this.cargando.set(false);
        this.router.navigate(['/cotizaciones/solicitar'], {
          queryParams: { empty: '1' },
        });
      },
    });
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
}
