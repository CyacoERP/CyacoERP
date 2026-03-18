import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CotizacionServicio } from '../../services/cotizacion.servicio';
import { Cotizacion } from '../../models/cotizacion.modelo';

@Component({
  selector: 'app-lista-cotizaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-cotizaciones.componente.html',
  styleUrl: './lista-cotizaciones.componente.css',
})
export class ListaCotizacionesComponente implements OnInit {
  cotizaciones = signal<Cotizacion[]>([]);
  cargando = signal(true);
  filtroEstado = '';

  constructor(private cotizacionServicio: CotizacionServicio) {}

  ngOnInit() {
    this.cargarCotizaciones();
  }

  cargarCotizaciones() {
    this.cotizacionServicio.obtenerTodas().subscribe({
      next: (datos: any) => {
        this.cotizaciones.set(datos || []);
        this.cargando.set(false);
      },
      error: (err: any) => {
        console.error('Error cargando', err);
        this.cargando.set(false);
      },
    });
  }
}
