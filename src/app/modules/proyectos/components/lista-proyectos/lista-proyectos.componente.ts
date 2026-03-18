import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProyectoServicio } from '../../services/proyecto.servicio';

@Component({
  selector: 'app-lista-proyectos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-proyectos.componente.html',
  styleUrl: './lista-proyectos.componente.css',
})
export class ListaProyectosComponente implements OnInit {
  proyectos = signal<any[]>([]);
  cargando = signal(true);

  constructor(private proyectoServicio: ProyectoServicio) {}

  ngOnInit() {
    this.proyectoServicio.obtenerTodos().subscribe({
      next: (datos: any) => {
        this.proyectos.set(datos || []);
        this.cargando.set(false);
      },
      error: (err: any) => {
        this.cargando.set(false);
      },
    });
  }
}
