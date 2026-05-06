import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/paypal`;

  crearOrden(items: any[]) {
    return this.http.post<{ id: string; status: string }>(
      `${this.apiUrl}/create-order`,
      { items }
    );
  }

  capturarOrden(orderId: string) {
    return this.http.post<any>(
      `${this.apiUrl}/capture-order`,
      { orderId }
    );
  }
}