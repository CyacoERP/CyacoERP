import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductoCardComponente } from './producto-card.componente';
import { Producto } from '../../../../shared/models/producto.modelo';

const productoMock: Producto = {
  id: 1,
  nombre: 'Laptop',
  precio: 1000,
  imagenUrl: 'img.jpg',
  descripcion: 'Descripcion de prueba',
  activo: true,
  stock: 5,
  categoriaId: 1,
  creadoEn: new Date(),
  actualizadoEn: new Date(),
};

describe('ProductoCardComponente', () => {
  let component: ProductoCardComponente;
  let fixture: ComponentFixture<ProductoCardComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoCardComponente],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoCardComponente);
    component = fixture.componentInstance;
    component.producto = productoMock;
    await fixture.whenStable();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el precio formateado', () => {
    expect(component.precioFormateado).toContain('MXN');
  });
});
