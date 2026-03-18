import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogoComponente } from './catalogo.componente';
import { ProductoServicio } from '../../services/producto.servicio';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('CatalogoComponente', () => {
  let component: CatalogoComponente;
  let fixture: ComponentFixture<CatalogoComponente>;

  beforeEach(async () => {
    const productoServicioSpy = { obtenerTodos: vi.fn().mockReturnValue(of([])) };

    await TestBed.configureTestingModule({
      imports: [CatalogoComponente],
      providers: [
        provideRouter([]),
        { provide: ProductoServicio, useValue: productoServicioSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });
});
