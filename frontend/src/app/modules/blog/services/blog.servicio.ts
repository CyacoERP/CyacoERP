import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BlogPost {
  id: number;
  titulo: string;
  contenido: string;
  autor: string;
  fechaPublicacion: Date;
  tags?: string[];
  imagenPrincipal?: string;
}

@Injectable({ providedIn: 'root' })
export class BlogServicio {
  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>('/api/blog');
  }

  obtenerPorId(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`/api/blog/${id}`);
  }

  crear(post: BlogPost): Observable<BlogPost> {
    return this.http.post<BlogPost>('/api/blog', post);
  }

  actualizar(id: number, post: BlogPost): Observable<BlogPost> {
    return this.http.put<BlogPost>(`/api/blog/${id}`, post);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`/api/blog/${id}`);
  }

  obtenerPorTag(tag: string): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`/api/blog/filtro/tag/${tag}`);
  }
}
