import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { Producto } from '../modelos/producto.modelo';

@Injectable({ providedIn: 'root' })
export class ProductoServicio {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  obtenerTodos(): Observable<Producto[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }

    return this.http.get('assets/productos.xml', { responseType: 'text' }).pipe(
      map((xml) => this.parsearProductosXml(xml))
    );
  }

  private parsearProductosXml(xmlText: string): Producto[] {
    if (typeof DOMParser === 'undefined') return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) {
      console.error('Error parseando XML de productos');
      return [];
    }

    const nodos = doc.getElementsByTagName('product');
    console.log(`${nodos.length} productos encontrados`);

    return Array.from(nodos).map((nodo) => ({
      id: this.getNumero(nodo, 'id'),
      name: this.getTexto(nodo, 'name'),
      price: this.getNumero(nodo, 'price'),
      imageUrl: this.getTexto(nodo, 'imageUrl'),
      category: this.getTexto(nodo, 'category'),
      description: this.getTexto(nodo, 'description'),
      inStock: this.getBooleano(nodo, 'inStock'),
    }));
  }

  private getTexto(parent: Element, tag: string): string {
    return parent.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';
  }

  private getNumero(parent: Element, tag: string): number {
    const valor = this.getTexto(parent, tag);
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
  }

  private getBooleano(parent: Element, tag: string): boolean {
    const valor = this.getTexto(parent, tag).toLowerCase();
    return valor === 'true' || valor === '1' || valor === 'yes';
  }
}
