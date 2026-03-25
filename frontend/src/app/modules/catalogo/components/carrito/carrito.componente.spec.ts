import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarritoComponente } from './carrito.componente';
import { provideRouter } from '@angular/router';

describe('CarritoComponente', () => {
  let component: CarritoComponente;
  let fixture: ComponentFixture<CarritoComponente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarritoComponente],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CarritoComponente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });
});
