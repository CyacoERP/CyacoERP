import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

export interface BlogPost {
  id: number;
  titulo: string;
  descripcion: string;
  contenido: string;
  categoria: string;
  categoriaLabel: string;
  autor: string;
  fecha: string;
  tiempoLectura: number;
  tags: string[];
  imagenPrincipal: string;
  destacado?: boolean;
  tieneVideo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class BlogServicio {
  private readonly posts: BlogPost[] = [
    {
      id: 1,
      titulo: '¿Cómo elegir el transmisor de presión correcto para tu proceso?',
      descripcion:
        'Guía completa para seleccionar transmisores de presión considerando rangos, certificaciones y compatibilidad con protocolos de comunicación industrial.',
      contenido:
        'Seleccionar un transmisor de presión requiere revisar rango operativo, precisión, certificaciones y condiciones de proceso. También es clave validar compatibilidad con protocolos como HART o Modbus para integración con tu sistema de control.',
      categoria: 'instrumentacion',
      categoriaLabel: 'Instrumentación',
      autor: 'Ing. Patricia Morales',
      fecha: '30-septiembre',
      tiempoLectura: 8,
      tags: ['#Presion', '#Transmisores', '#4MART', '#Seleccion'],
      imagenPrincipal: '/assets/images/photo-1672689956124-18666b4cdae4.jpg',
      destacado: true,
      tieneVideo: false,
    },
    {
      id: 2,
      titulo: 'Medición de flujo electromagnético: ventajas y aplicaciones',
      descripcion:
        'La medición electromagnética ofrece ventajas en la industria del agua y observación al flujo. Conoce sus ventajas frente a otras...',
      contenido:
        'Los medidores electromagnéticos son ideales para líquidos conductivos. Su baja caída de presión y mantenimiento sencillo los vuelven una excelente opción para procesos industriales críticos.',
      categoria: 'tecnologia',
      categoriaLabel: 'Tecnología',
      autor: 'Ing. Juan López',
      fecha: '15-ago',
      tiempoLectura: 6,
      tags: ['#Flujo', '#Medicion', '#Agua'],
      imagenPrincipal: '/assets/images/photo-1689942007858-7b12bf5864bd.jpg',
      tieneVideo: true,
    },
    {
      id: 3,
      titulo: 'Certificaciones ATEX e IECEx: todo lo que necesitas saber',
      descripcion:
        'La seguridad en zonas peligrosas resulta importante. Aprende a interpretar las certificaciones ATEX e IECEx y seleccionar el...',
      contenido:
        'ATEX e IECEx garantizan que el equipo cumple requisitos para atmósferas explosivas. Una correcta selección evita riesgos y asegura cumplimiento normativo.',
      categoria: 'seguridad',
      categoriaLabel: 'Seguridad',
      autor: 'Ing. Carlos Ruiz',
      fecha: '10-ago',
      tiempoLectura: 10,
      tags: ['#ATEX', '#IECEx', '#Seguridad'],
      imagenPrincipal: '/assets/images/photo-1761758674188-2b8e4c89c5e2.jpg',
      tieneVideo: false,
    },
    {
      id: 4,
      titulo: 'Tendencias en automatización industrial 2025',
      descripcion:
        'IoT, gemelos digitales, IA en mantenimiento predictivo. Las tendencias que transformarán la automatización industrial en 2025 y más...',
      contenido:
        'La convergencia entre analítica avanzada, digital twins e IA está acelerando la toma de decisiones en planta y reduciendo tiempos de paro.',
      categoria: 'industria_40',
      categoriaLabel: 'Industria 4.0',
      autor: 'Dr. Roberto Silva',
      fecha: '5-ago',
      tiempoLectura: 12,
      tags: ['#IoT', '#Industria40', '#Automatizacion'],
      imagenPrincipal: '/assets/images/photo-1763889107827-8e7d7960d68a.jpg',
      tieneVideo: true,
    },
    {
      id: 5,
      titulo: 'Mantenimiento predictivo con vibración y temperatura',
      descripcion:
        'El monitoreo continúo de vibración y temperatura permite detectar fallas incipientes en el equipo rotativo antes de que ocurra...',
      contenido:
        'Implementar rutinas de monitoreo predictivo permite planear mantenimientos y evitar fallas catastróficas en activos críticos.',
      categoria: 'mantenimiento',
      categoriaLabel: 'Mantenimiento',
      autor: 'Ing. Sofía García',
      fecha: '8-ago',
      tiempoLectura: 7,
      tags: ['#Vibracion', '#Temperatura', '#Mantenimiento'],
      imagenPrincipal: '/assets/images/photo-1766325693346-6279a63b1fba.jpg',
      tieneVideo: true,
    },
  ];

  obtenerTodos(): Observable<BlogPost[]> {
    return of(this.posts);
  }

  obtenerPorId(id: number): Observable<BlogPost> {
    const articulo = this.posts.find((post) => post.id === id);
    return articulo
      ? of(articulo)
      : throwError(() => new Error('No se encontró el artículo solicitado.'));
  }

  crear(post: BlogPost): Observable<BlogPost> {
    return of(post);
  }

  actualizar(id: number, post: BlogPost): Observable<BlogPost> {
    return of({ ...post, id });
  }

  eliminar(id: number): Observable<void> {
    return of(void 0);
  }

  obtenerPorTag(tag: string): Observable<BlogPost[]> {
    return of(this.posts.filter((post) => post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())));
  }
}
