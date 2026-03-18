import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../services/products.service';
import { CartService } from '../../services/cart.service';

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description: string;
  inStock: boolean;
  brand?: string;
  rating?: number;
  reviews?: number;
  protocols?: string[];
  sku?: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  brands: string[] = [];
  selectedCategories: Set<string> = new Set();
  selectedBrands: Set<string> = new Set();
  sortBy: string = 'relevancia';
  searchTerm: string = '';
  priceRange: { min: number; max: number } = { min: 0, max: 100000 };

  constructor(
    private productsService: ProductsService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productsService.getAll().subscribe(products => {
      this.products = products;
      this.extractFilters();
      this.applyFilters();
    });
  }

  extractFilters() {
    this.categories = [...new Set(this.products.map(p => p.category))].sort();
    this.brands = [...new Set(this.products.map(p => p.brand || 'Sin marca'))].sort();
  }

  applyFilters() {
    let filtered = this.products;

    // Filtrar por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term)
      );
    }

    // Filtrar por categoría
    if (this.selectedCategories.size > 0) {
      filtered = filtered.filter(p => this.selectedCategories.has(p.category));
    }

    // Filtrar por marca
    if (this.selectedBrands.size > 0) {
      filtered = filtered.filter(p => this.selectedBrands.has(p.brand || 'Sin marca'));
    }

    // Filtrar por precio
    filtered = filtered.filter(p => p.price >= this.priceRange.min && p.price <= this.priceRange.max);

    // Ordenar
    this.sortProducts(filtered);
    this.filteredProducts = filtered;
  }

  sortProducts(products: Product[]) {
    switch (this.sortBy) {
      case 'precio_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'precio_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'relevancia':
      default:
        break;
    }
  }

  toggleCategory(category: string) {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }
    this.applyFilters();
  }

  toggleBrand(brand: string) {
    if (this.selectedBrands.has(brand)) {
      this.selectedBrands.delete(brand);
    } else {
      this.selectedBrands.add(brand);
    }
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  addToCart(product: Product) {
    this.cartService.addProduct(product);
    alert(`${product.name} agregado al carrito`);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(price);
  }

  getCategoryCount(category: string): number {
    return this.products.filter(p => p.category === category).length;
  }
}