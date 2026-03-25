export interface Producto {
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
  protocols?: string;
  sku?: string;
}
