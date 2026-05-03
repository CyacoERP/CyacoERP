import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogoComponente } from './catalogo.componente';
import { ProductoServicio } from '../../services/producto.servicio';
import { CategoriaServicio } from '../../services/categoria.servicio';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Producto } from '../../../../shared/models/producto.modelo';

const productosMock: Producto[] = [
  {
    id: 1,
    nombre: 'Transmisor Presion X100',
    descripcion: 'Transmisor para linea de vapor',
    precio: 12000,
    stock: 10,
    categoriaId: 1,
    activo: true,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  },
  {
    id: 2,
    nombre: 'Caudalimetro Electromagnetico',
    descripcion: 'Sensor de flujo para agua de proceso',
    precio: 26000,
    stock: 5,
    categoriaId: 2,
    activo: true,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  },
  {
    id: 3,
    nombre: 'RTD PT100 Pro',
    descripcion: 'Sensor temperatura industrial',
    precio: 2500,
    stock: 20,
    categoriaId: 3,
    activo: true,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
  },
];

describe('CatalogoComponente', () => {
  let component: CatalogoComponente;
  let fixture: ComponentFixture<CatalogoComponente>;

  beforeEach(async () => {
    const productoServicioSpy = { obtenerTodos: vi.fn().mockReturnValue(of(productosMock)) };
    const categoriaServicioSpy = {
      obtenerTodas: vi.fn().mockReturnValue(
        of([
          { id: 1, nombre: 'Presion' },
          { id: 2, nombre: 'Flujo' },
          { id: 3, nombre: 'Temperatura' },
        ]),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [CatalogoComponente],
      providers: [
        provideRouter([]),
        { provide: ProductoServicio, useValue: productoServicioSpy },
        { provide: CategoriaServicio, useValue: categoriaServicioSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoComponente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('filtra por término de búsqueda en nombre/descripción', () => {
    component.searchTerm = 'flujo';
    component.onSearchChange();

    expect(component.productos().length).toBe(1);
    expect(component.productos()[0].nombre).toContain('Caudalimetro');
  });

  it('filtra por categoría seleccionada', () => {
    component.toggleCategory(1);

    expect(component.productos().length).toBe(1);
    expect(component.productos()[0].categoriaId).toBe(1);
  });

  it('filtra por rango de precio', () => {
    component.updatePriceRange(10000, 15000);

    expect(component.productos().length).toBe(1);
    expect(component.productos()[0].precio).toBe(12000);
  });
});
