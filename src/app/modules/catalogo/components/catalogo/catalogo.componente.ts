import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoServicio } from '../../services/producto.servicio';
import { CarritoServicio } from '../../services/carrito.servicio';
import { Producto } from '../../../../shared/models/producto.modelo';

interface ProductFilter {
  categories: Set<string>;
  brands: Set<string>;
  priceRange: { min: number; max: number };
}

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './catalogo.componente.html',
  styleUrl: './catalogo.componente.css',
})
export class CatalogoComponente implements OnInit {
  readonly productosOriginales = signal<Producto[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  
  searchTerm = '';
  sortBy = 'relevancia';
  
  filters: ProductFilter = {
    categories: new Set(),
    brands: new Set(),
    priceRange: { min: 0, max: 10000 },
  };

  categories: string[] = [];
  brands: string[] = [];
  priceRanges = [
    { label: 'Menor a $500', min: 0, max: 500 },
    { label: '$500 - $1,000', min: 500, max: 1000 },
    { label: '$1,000 - $5,000', min: 1000, max: 5000 },
    { label: 'Mayor a $5,000', min: 5000, max: 10000 },
  ];

  constructor(
    private productoServicio: ProductoServicio,
    private carritoServicio: CarritoServicio
  ) {}

  get totalItemsCarrito(): number {
    return this.carritoServicio.totalItems();
  }

  ngOnInit(): void {
    this.productoServicio.obtenerTodos().subscribe({
      next: (prods) => {
        this.productosOriginales.set(prods);
        this.productos.set(prods);
        this.cargando.set(false);
        this.extractFilters(prods);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  private extractFilters(productos: Producto[]): void {
    const categories = new Set<string>();
    const brands = new Set<string>();

    productos.forEach(p => {
      if (p.category) categories.add(p.category);
      // Brands would need to be added to the model if needed
    });

    this.categories = Array.from(categories).sort();
    this.brands = Array.from(brands).sort();
  }

  toggleCategory(category: string): void {
    if (this.filters.categories.has(category)) {
      this.filters.categories.delete(category);
    } else {
      this.filters.categories.add(category);
    }
    this.applyFilters();
  }

  toggleBrand(brand: string): void {
    if (this.filters.brands.has(brand)) {
      this.filters.brands.delete(brand);
    } else {
      this.filters.brands.add(brand);
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
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }

    // Filtro por categorías
    if (this.filters.categories.size > 0) {
      filtered = filtered.filter(p => this.filters.categories.has(p.category || ''));
    }

    // Filtro por marcas (no aplicar si no hay marcas)
    if (this.filters.brands.size > 0) {
      filtered = filtered.filter(p => this.filters.brands.has(p.category || ''));
    }

    // Filtro por precio
    filtered = filtered.filter(p =>
      p.price >= this.filters.priceRange.min && p.price <= this.filters.priceRange.max
    );

    // Ordenamiento
    this.sortProducts(filtered);
  }

  private sortProducts(productos: Producto[]): void {
    const sorted = [...productos];

    switch (this.sortBy) {
      case 'precio_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'precio_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        // Mantener orden original (relevancia)
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

  isCategoryChecked(category: string): boolean {
    return this.filters.categories.has(category);
  }

  isBrandChecked(brand: string): boolean {
    return this.filters.brands.has(brand);
  }
}
