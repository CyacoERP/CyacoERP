import { TestBed } from '@angular/core/testing';
import { ProductoServicio } from './producto.servicio';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('ProductoServicio', () => {
  let servicio: ProductoServicio;

  beforeEach(() => {
    const httpSpy = { get: vi.fn().mockReturnValue(of('')) };

    TestBed.configureTestingModule({
      providers: [
        ProductoServicio,
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    servicio = TestBed.inject(ProductoServicio);
  });

  it('debe crearse correctamente', () => {
    expect(servicio).toBeTruthy();
  });
});
