import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductoCardComponente } from './producto-card.componente';
import { Producto } from '../../modelos/producto.modelo';

const productoMock: Producto = {
  id: 1,
  name: 'Laptop',
  price: 1000,
  imageUrl: 'img.jpg',
  category: 'Electrónica',
  description: 'Descripción de prueba',
  inStock: true,
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
