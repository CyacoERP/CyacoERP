import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Producto } from '../../../shared/models/producto.modelo';

@Injectable({ providedIn: 'root' })
export class ProductoServicio {
  private productos: Producto[] = [
    {
      id: 1,
      name: 'Transmisor de Presión Diferencial FT-2500',
      price: 12500,
      imageUrl: 'assets/images/photo-1672689956124-18666b4cdae4.jpg',
      category: 'Sensores de Presión',
      description: 'Transmisor de presión diferencial de última generación',
      inStock: true,
      brand: 'Endress+Hauser',
      rating: 4.3,
      reviews: 32,
      protocols: 'HART 7.0, PROFIBUS/PA',
      sku: 'EH-FT2500-01'
    },
    {
      id: 2,
      name: 'Medidor de Flujo Electromagnético',
      price: 28000,
      imageUrl: 'assets/images/photo-1689942007858-7b12bf5864bd.jpg',
      category: 'Medidores de Flujo',
      description: 'Medidor de flujo electromagnético de precisión industrial',
      inStock: true,
      brand: 'Yokogawa',
      rating: 4.3,
      reviews: 47,
      protocols: 'HART 7.0, PROFIBUS/DP',
      sku: 'YOK-FM4420-02'
    },
    {
      id: 3,
      name: 'Transmisor de Temperatura iTEMP',
      price: 8900,
      imageUrl: 'assets/images/photo-1761758674188-2b8e4c89c5e2.jpg',
      category: 'Instrumentos de Temperatura',
      description: 'Transmisor de temperatura inteligente con diagnóstico',
      inStock: true,
      brand: 'Endress+Hauser',
      rating: 4.7,
      reviews: 35,
      protocols: 'HART 7.0, ISIAG100',
      sku: 'EH-TMT142-01'
    },
    {
      id: 4,
      name: 'Analizador de Oxígeno Disuelto Liquilyg M',
      price: 22000,
      imageUrl: 'assets/images/photo-1763889107827-8e7d7960d68a.jpg',
      category: 'Analizadores de Gas',
      description: 'Analizador de oxígeno disuelto para aplicaciones de agua',
      inStock: true,
      brand: 'Emerson',
      rating: 4.4,
      reviews: 14,
      protocols: 'Modbus RTU, HART 7.0',
      sku: 'EMR-LqM500-01'
    },
    {
      id: 5,
      name: 'Controlador PID Yokogawa UT55A',
      price: 15400,
      imageUrl: 'assets/images/photo-1766325693346-6279a63b1fba.jpg',
      category: 'Controladores PID',
      description: 'Controlador PID compacto para aplicaciones industriales',
      inStock: true,
      brand: 'Yokogawa',
      rating: 4.5,
      reviews: 58,
      protocols: 'EtherNet MODBUS/TCP',
      sku: 'YOK-UT55A-01'
    },
    {
      id: 6,
      name: 'Válvula de Control SAMSON 3241',
      price: 45000,
      imageUrl: 'assets/images/photo-1672689956124-18666b4cdae4.jpg',
      category: 'Válvulas de Control',
      description: 'Válvula de control de precisión con actuador neumático',
      inStock: true,
      brand: 'ABB',
      rating: 4.2,
      reviews: 22,
      protocols: 'HART 7.0, 4-20 mA',
      sku: 'SAM-3241-01'
    },
    {
      id: 7,
      name: 'Sensor de Presión Absoluta Vega',
      price: 18500,
      imageUrl: 'assets/images/photo-1689942007858-7b12bf5864bd.jpg',
      category: 'Sensores de Presión',
      description: 'Sensor de presión absoluta tipo flush para aplicaciones exigentes',
      inStock: false,
      brand: 'Vega',
      rating: 4.6,
      reviews: 41,
      protocols: 'HART 7.0, Profibus',
      sku: 'VGA-PA330-01'
    },
    {
      id: 8,
      name: 'Transmisor de Temperatura RTD Honeywell',
      price: 6800,
      imageUrl: 'assets/images/photo-1761758674188-2b8e4c89c5e2.jpg',
      category: 'Instrumentos de Temperatura',
      description: 'Transmisor de temperatura RTD de respuesta rápida',
      inStock: true,
      brand: 'Honeywell',
      rating: 4.1,
      reviews: 28,
      protocols: '4-20 mA, Modbus',
      sku: 'HNY-RTD500-01'
    }
  ];

  constructor() {}

  obtenerTodos(): Observable<Producto[]> {
    return of(this.productos);
  }
}
