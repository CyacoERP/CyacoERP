import { AfterViewInit, Component, ElementRef, inject, ViewChild, } from '@angular/core';
import { CarritoServicio } from '../../services/carrito.servicio';
import { PaypalService } from '../../services/paypal.servicio';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

declare const paypal: any;
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements AfterViewInit {
 @ViewChild('paypalButtonContainer')
  paypalButtonContainer!: ElementRef<HTMLDivElement>;


  private carritoService = inject(CarritoServicio);
  private paypalService = inject(PaypalService);

  carrito = this.carritoService.itemsCarrito;
  total = () => this.carritoService.totalPrecio(); 
  mensaje = '';
  ngAfterViewInit(): void {    
    this.renderPayPalButton();
  }
  private renderPayPalButton() {
    if(this.carrito().length == 0){
      return;
    }
    if(typeof paypal === 'undefined'){
      this.mensaje = 'Error al cargar PayPal. Intenta recargar la página.';
      return;
    }
    if(!this.paypalButtonContainer){
       return;
    }
    this.paypalButtonContainer.nativeElement.innerHTML = '';
    paypal.Buttons({
      createOrder: async () => {
        try {
          const response = await firstValueFrom(
            this.paypalService.crearOrden(this.carrito())
          );

          return response.id;
        } catch (error) {
          console.error('Error al crear la orden:', error);
          this.mensaje = 'No se pudo crear la orden.';
          throw error;
        }
      },

      onApprove: async (data: any) => {
        try {
          const capture = await firstValueFrom(
            this.paypalService.capturarOrden(data.orderID)
          );

          console.log('Pago capturado:', capture);
          this.mensaje = 'Pago realizado correctamente.';
          this.carritoService.vaciarCarrito();
          this.paypalButtonContainer.nativeElement.innerHTML = '';
        } catch (error) {
          console.error('Error al capturar el pago:', error);
          this.mensaje = 'Ocurrió un error al capturar el pago.';
        }
      },

      onCancel: () => {
        this.mensaje = 'El usuario canceló el pago.';
      },

      onError: (error: any) => {
        console.error('Error PayPal:', error);
        this.mensaje = 'Error en el proceso de PayPal.';
      }
    }).render(this.paypalButtonContainer.nativeElement);

  }
}
