import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogServicio, BlogPost } from '../../services/blog.servicio';

@Component({
  selector: 'app-lista-blog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-blog.componente.html',
  styleUrl: './lista-blog.componente.css',
})
export class ListaBlogComponente implements OnInit {
  posts = signal<BlogPost[]>([]);
  cargando = signal(true);

  constructor(private blogServicio: BlogServicio) {}

  ngOnInit() {
    this.blogServicio.obtenerTodos().subscribe({
      next: (datos: any) => {
        this.posts.set(datos || []);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }
}
