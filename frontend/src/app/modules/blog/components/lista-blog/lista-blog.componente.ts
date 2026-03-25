import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogServicio } from '../../services/blog.servicio';

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
  imports: [CommonModule],
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
      imagen: '/assets/images/instrumentacion-presion.png',
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
      imagen: '/assets/images/medicion-flujo.png',
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
      imagen: '/assets/images/certificaciones-atex.png',
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
      imagen: '/assets/images/automatizacion-2025.png',
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
      imagen: '/assets/images/mantenimiento-predictivo.png',
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
      imagen: '/assets/images/protocolos-comunicacion.png',
      categoria: 'comunicacion',
      categoriaLabel: 'Comunicación',
      autor: 'Ing. Marco Antúnez',
      fecha: '1-ago',
      tiempoLectura: 9,
      etiquetas: ['#HART', '#ModBus', '#Profibus'],
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
      next: () => {
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
}
