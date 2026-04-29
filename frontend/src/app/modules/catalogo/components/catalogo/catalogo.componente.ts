import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoServicio } from '../../services/producto.servicio';
import { CategoriaServicio } from '../../services/categoria.servicio';
import { CarritoServicio } from '../../services/carrito.servicio';
import { ModalStateServicio } from '../../services/modal-state.servicio';
import { CarritoPreviewComponent } from '../carrito-preview/carrito-preview.componente';
import { Producto } from '../../../../shared/models/producto.modelo';

interface ProductFilter {
  categories: Set<number>;
  priceRange: { min: number; max: number };
}

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, FormsModule, CarritoPreviewComponent],
  standalone: true,
  templateUrl: './catalogo.componente.html',
  styleUrl: './catalogo.componente.css',
})
export class CatalogoComponente implements OnInit {
  readonly productosOriginales = signal<Producto[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<any[]>([]);
  readonly cargando = signal(true);
  
  searchTerm = '';
  sortBy = 'relevancia';
  
  filters: ProductFilter = {
    categories: new Set(),
    priceRange: { min: 0, max: 100000 },
  };

  priceRanges = [
    { label: 'Hasta $10,000', min: 0, max: 10000 },
    { label: '$10,000 - $25,000', min: 10000, max: 25000 },
    { label: '$25,000 - $50,000', min: 25000, max: 50000 },
    { label: 'Más de $50,000', min: 50000, max: Number.MAX_SAFE_INTEGER },
  ];

  constructor(
    private productoServicio: ProductoServicio,
    private categoriaServicio: CategoriaServicio,
    public carritoServicio: CarritoServicio,
    private modalState: ModalStateServicio
  ) {}

  get totalItemsCarrito(): number {
    return this.carritoServicio.totalItems();
  }

  ngOnInit(): void {
    // Cargar categorías
    this.categoriaServicio.obtenerTodas().subscribe({
      next: (cats) => {
        this.categorias.set(cats);
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
      },
    });

    // Cargar productos
    this.productoServicio.obtenerTodos().subscribe({
      next: (prods) => {
        this.productosOriginales.set(prods);
        this.productos.set(prods);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.cargando.set(false);
      },
    });
  }

  toggleCategory(categoryId: number): void {
    if (this.filters.categories.has(categoryId)) {
      this.filters.categories.delete(categoryId);
    } else {
      this.filters.categories.add(categoryId);
    }
    this.applyFilters();
  }

  updatePriceRange(min: number, max: number): void {
    this.filters.priceRange = { min, max };
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.productosOriginales();

    // Filtro por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion?.toLowerCase().includes(term)
      );
    }

    // Filtro por categorías
    if (this.filters.categories.size > 0) {
      filtered = filtered.filter(p => this.filters.categories.has(p.categoriaId));
    }

    // Filtro por precio
    filtered = filtered.filter(p =>
      p.precio >= this.filters.priceRange.min && p.precio <= this.filters.priceRange.max
    );

    // Ordenamiento
    this.sortProducts(filtered);
  }

  private sortProducts(productos: Producto[]): void {
    const sorted = [...productos];

    switch (this.sortBy) {
      case 'precio_asc':
        sorted.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_desc':
        sorted.sort((a, b) => b.precio - a.precio);
        break;
      case 'relevancia':
      default:
        // Mantener el orden original
        break;
    }

    this.productos.set(sorted);
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  onAgregarAlCarrito(producto: Producto): void {
    this.carritoServicio.agregarProducto(producto);
  }

  abrirCarritoPreview(): void {
    this.modalState.abrirCarritoDrawer();
  }
}
