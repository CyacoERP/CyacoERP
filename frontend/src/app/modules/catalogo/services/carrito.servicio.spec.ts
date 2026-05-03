import { TestBed } from '@angular/core/testing';
import { CarritoServicio } from './carrito.servicio';
import { Producto } from '../../../shared/models/producto.modelo';

const productoMock: Producto = {
  id: 1,
  nombre: 'Test',
  precio: 100,
  imagenUrl: '',
  descripcion: 'desc',
  activo: true,
  stock: 10,
  categoriaId: 1,
  creadoEn: new Date(),
  actualizadoEn: new Date(),
};

describe('CarritoServicio', () => {
  let servicio: CarritoServicio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servicio = TestBed.inject(CarritoServicio);
  });

  it('debe crearse correctamente', () => {
    expect(servicio).toBeTruthy();
  });

  it('debe agregar un producto al carrito', () => {
    servicio.agregarProducto(productoMock);
    expect(servicio.totalItems()).toBe(1);
    expect(servicio.totalPrecio()).toBe(100);
  });

  it('debe incrementar la cantidad al agregar el mismo producto', () => {
    servicio.agregarProducto(productoMock);
    servicio.agregarProducto(productoMock);
    expect(servicio.totalItems()).toBe(2);
  });

  it('debe quitar un producto del carrito', () => {
    servicio.agregarProducto(productoMock);
    servicio.quitarProducto(1);
    expect(servicio.totalItems()).toBe(0);
  });

  it('debe vaciar el carrito', () => {
    servicio.agregarProducto(productoMock);
    servicio.vaciarCarrito();
    expect(servicio.itemsCarrito().length).toBe(0);
  });

  it('debe generar un recibo XML válido', () => {
    servicio.agregarProducto(productoMock);
    const xml = servicio.generarReciboXml();
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<recibo>');
    expect(xml).toContain('<total>');
  });
});
