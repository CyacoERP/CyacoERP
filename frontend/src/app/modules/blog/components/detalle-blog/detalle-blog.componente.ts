import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogPost, BlogServicio } from '../../services/blog.servicio';

@Component({
  selector: 'app-detalle-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-blog.componente.html',
  styleUrl: './detalle-blog.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleBlogComponente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly blogServicio = inject(BlogServicio);

  readonly cargando = signal(true);
  readonly conError = signal(false);
  readonly articulo = signal<BlogPost | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id || Number.isNaN(id)) {
        this.cargando.set(false);
        this.conError.set(true);
        return;
      }

      this.cargando.set(true);
      this.conError.set(false);

      this.blogServicio.obtenerPorId(id).subscribe({
        next: (post) => {
          this.articulo.set(post);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
          this.conError.set(true);
        },
      });
    });
  }
}
