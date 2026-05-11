import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogPost, BlogServicio } from '../../services/blog.servicio';

type Categoria =
  | 'todos'
  | 'instrumentacion'
  | 'tecnologia'
  | 'seguridad'
  | 'industria_40'
  | 'mantenimiento'
  | 'comunicacion';

interface Articulo {
  id: number;
  titulo: string;
  descripcion: string;
  contenido?: string;
  imagen: string;
  categoria: string;
  categoriaLabel: string;
  autor: string;
  fecha: string;
  tiempoLectura: number;
  etiquetas: string[];
  destacado?: boolean;
  tieneVideo?: boolean;
}

@Component({
  selector: 'app-lista-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-blog.componente.html',
  styleUrl: './lista-blog.componente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaBlogComponente implements OnInit {
  private readonly blogServicio = inject(BlogServicio);

  readonly cargando = signal(true);
  readonly categoriaSeleccionada = signal<Categoria>('todos');
  readonly busqueda = signal('');

  readonly articulos = signal<Articulo[]>([
    {
      id: 1,
      titulo: '¿Cómo elegir el transmisor de presión correcto para tu proceso?',
      descripcion:
        'Guía completa para seleccionar transmisores de presión considerando rangos, certificaciones y compatibilidad con protocolos de comunicación industrial.',
      imagen: '/assets/images/photo-1672689956124-18666b4cdae4.jpg',
      categoria: 'instrumentacion',
      categoriaLabel: 'INSTRUMENTACIÓN',
      autor: 'Ing. Patricia Morales',
      fecha: '30-septiembre',
      tiempoLectura: 8,
      etiquetas: ['#Presion', '#Transmisores', '#4MART', '#Seleccion'],
      destacado: true,
      tieneVideo: false,
    },
    {
      id: 2,
      titulo: 'Medición de flujo electromagnético: ventajas y aplicaciones',
      descripcion:
        'La medición electromagnética ofrece ventajas en la industria del agua y observación al flujo. Conoce sus ventajas frente a otras...',
      imagen: '/assets/images/photo-1689942007858-7b12bf5864bd.jpg',
      categoria: 'tecnologia',
      categoriaLabel: 'Tecnología',
      autor: 'Ing. Juan López',
      fecha: '15-ago',
      tiempoLectura: 6,
      etiquetas: ['#Flujo', '#Medicion', '#Agua'],
      tieneVideo: true,
    },
    {
      id: 3,
      titulo: 'Certificaciones ATEX e IECEx: todo lo que necesitas saber',
      descripcion:
        'La seguridad en zonas peligrosas resulta importante. Aprende a interpretar las certificaciones ATEX e IECEx y seleccionar el...',
      imagen: '/assets/images/photo-1761758674188-2b8e4c89c5e2.jpg',
      categoria: 'seguridad',
      categoriaLabel: 'Seguridad',
      autor: 'Ing. Carlos Ruiz',
      fecha: '10-ago',
      tiempoLectura: 10,
      etiquetas: ['#ATEX', '#IECEx', '#Seguridad'],
      tieneVideo: false,
    },
    {
      id: 4,
      titulo: 'Tendencias en automatización industrial 2025',
      descripcion:
        'IoT, gemelos digitales, IA en mantenimiento predictivo. Las tendencias que transformarán la automatización industrial en 2025 y más...',
      imagen: '/assets/images/photo-1763889107827-8e7d7960d68a.jpg',
      categoria: 'industria_40',
      categoriaLabel: 'Industria 4.0',
      autor: 'Dr. Roberto Silva',
      fecha: '5-ago',
      tiempoLectura: 12,
      etiquetas: ['#IoT', '#Industria40', '#Automatizacion'],
      tieneVideo: true,
    },
    {
      id: 5,
      titulo: 'Mantenimiento predictivo con vibración y temperatura',
      descripcion:
        'El monitoreo continúo de vibración y temperatura permite detectar fallas incipientes en el equipo rotativo antes de que ocurra...',
      imagen: '/assets/images/photo-1766325693346-6279a63b1fba.jpg',
      categoria: 'mantenimiento',
      categoriaLabel: 'Mantenimiento',
      autor: 'Ing. Sofía García',
      fecha: '8-ago',
      tiempoLectura: 7,
      etiquetas: ['#Vibracion', '#Temperatura', '#Mantenimiento'],
      tieneVideo: true,
    },
    {
      id: 6,
      titulo: 'Protocolos de comunicación industrial: HART, ModBus y Profibus',
      descripcion:
        'Comparativa entre los principales protocolos de comunicación industrial. Ventajas, desventajas y casos de uso de HART, ModBus...',
      imagen: '/assets/images/photo-1672689956124-18666b4cdae4.jpg',
      categoria: 'comunicacion',
      categoriaLabel: 'Comunicación',
      autor: 'Ing. Marco Antúnez',
      fecha: '1-ago',
      tiempoLectura: 9,
      etiquetas: ['#HART', '#ModBus', '#Profibus'],
      tieneVideo: false,
    },
    {
      id: 7,
      titulo: 'Checklist de comisionamiento para instrumentos de campo',
      descripcion:
        'Pasos clave para validar instalación, lazos 4-20mA y comunicación antes de arrancar una nueva línea de producción.',
      imagen: '/assets/images/photo-1689942007858-7b12bf5864bd.jpg',
      categoria: 'instrumentacion',
      categoriaLabel: 'Instrumentación',
      autor: 'Ing. Daniela Prado',
      fecha: '26-julio',
      tiempoLectura: 7,
      etiquetas: ['#Comisionamiento', '#Lazos', '#Startup'],
      tieneVideo: false,
    },
    {
      id: 8,
      titulo: 'Cómo reducir falsas alarmas en tableros de control',
      descripcion:
        'Estrategias de configuración de umbrales, histéresis y validación de señales para minimizar alarmas espurias.',
      imagen: '/assets/images/photo-1761758674188-2b8e4c89c5e2.jpg',
      categoria: 'seguridad',
      categoriaLabel: 'Seguridad',
      autor: 'Ing. Raúl Esparza',
      fecha: '22-julio',
      tiempoLectura: 6,
      etiquetas: ['#Alarmas', '#SCADA', '#Operación'],
      tieneVideo: true,
    },
    {
      id: 9,
      titulo: 'Guía rápida para redes Modbus estables en planta',
      descripcion:
        'Buenas prácticas de cableado, terminación y diagnóstico para enlaces RTU/TCP de alta disponibilidad.',
      imagen: '/assets/images/photo-1763889107827-8e7d7960d68a.jpg',
      categoria: 'comunicacion',
      categoriaLabel: 'Comunicación',
      autor: 'Ing. Fabián Contreras',
      fecha: '18-julio',
      tiempoLectura: 8,
      etiquetas: ['#Modbus', '#RedesIndustriales', '#Diagnóstico'],
      tieneVideo: false,
    },
  ]);

  readonly temas = signal<string[]>([
    '#Instrumentación',
    '#Transmisores',
    '#4MART',
    '#Seleccion',
    '#Flujo',
    '#Medicion',
    '#Electromagnetico',
    '#Aplicaciones',
    '#ATEX',
    '#IECEx',
    '#Seguridad',
    '#Zonas Peligrosas',
    '#Industria 4.0',
    '#IoT',
    '#Automatización',
    '#Ai',
    '#20mAh',
    'RAT EX',
  ]);

  readonly articuloDestacado = computed(() =>
    this.articulosFiltrados().find((a) => a.destacado),
  );

  readonly articulosFiltrados = computed(() => {
    const articulos = this.articulos();
    const categoria = this.categoriaSeleccionada();
    const busqueda = this.busqueda().toLowerCase();

    return articulos.filter((articulo) => {
      const coincideCategoria =
        categoria === 'todos' || articulo.categoria === categoria;
      const coincideBusqueda =
        busqueda === '' ||
        articulo.titulo.toLowerCase().includes(busqueda) ||
        articulo.descripcion.toLowerCase().includes(busqueda) ||
        articulo.autor.toLowerCase().includes(busqueda);

      return coincideCategoria && coincideBusqueda;
    });
  });

  readonly articulosGrid = computed(() =>
    this.articulosFiltrados().filter((a) => !a.destacado),
  );

  ngOnInit(): void {
    this.blogServicio.obtenerTodos().subscribe({
      next: (datos) => {
        const articulos = (datos ?? []).map((post) => this.mapearPost(post));
        this.articulos.set(articulos);
        this.temas.set([...new Set(articulos.flatMap((articulo) => articulo.etiquetas))]);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  cambiarCategoria(categoria: Categoria): void {
    this.categoriaSeleccionada.set(categoria);
  }

  actualizarBusqueda(query: string): void {
    this.busqueda.set(query);
  }

  trackPorId(_: number, articulo: Articulo): number {
    return articulo.id;
  }

  getImagenPlaceholder(categoria: string): string {
    const colores: Record<string, string> = {
      instrumentacion: '#3f82f1',
      tecnologia: '#8b5cf6',
      seguridad: '#dc2626',
      industria_40: '#14b8a6',
      mantenimiento: '#f59e0b',
      comunicacion: '#06b6d4',
    };
    return colores[categoria] || '#6b7280';
  }

  onImagenError(event: Event, categoria: string): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      parent.style.backgroundColor = this.getImagenPlaceholder(categoria);
    }
  }

  private mapearPost(post: BlogPost): Articulo {
    return {
      id: post.id,
      titulo: post.titulo,
      descripcion: post.descripcion,
      contenido: post.contenido,
      imagen: post.imagenPrincipal,
      categoria: post.categoria,
      categoriaLabel: post.categoriaLabel,
      autor: post.autor,
      fecha: post.fecha,
      tiempoLectura: post.tiempoLectura,
      etiquetas: post.tags,
      destacado: post.destacado,
      tieneVideo: post.tieneVideo,
    };
  }
}
