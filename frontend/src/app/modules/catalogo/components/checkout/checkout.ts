import { AfterViewInit, Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { CarritoServicio } from '../../services/carrito.servicio';
import { PaypalService } from '../../services/paypal.servicio';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthServicio } from '../../../auth/services/auth.servicio';

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
  private authServicio = inject(AuthServicio);

  carrito = this.carritoService.itemsCarrito;
  total = () => this.carritoService.totalPrecio();
  mensaje = '';
  readonly mostrarModalPago = signal(false);
  itemsPagados: any[] = [];
  ordenPagadaId = '';
  nombreArchivoComprobante = '';

  ngAfterViewInit(): void {    
    this.renderPayPalButton();
  }

  private descargarXML(datos: any[], orderId: string) {
    const xmlContent = this.generarXML(datos, orderId);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = this.nombreArchivoComprobante || `comprobante-pago-${orderId}.xml`;
    link.click();

    URL.revokeObjectURL(url);
  }

  private generarXML(datos: any[], orderId: string): string {
    const usuario = this.authServicio.obtenerUsuarioActual();
    const subtotalBase = datos.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
    const importeIva = parseFloat((subtotalBase * 0.16).toFixed(2));
    const totalFactura = parseFloat((subtotalBase + importeIva).toFixed(2));
    const folio = this.generarFolioComprobante(orderId);

    const articulos = datos.map((item) => `    <articulo>
      <id>${this.escapeXml(String(item.producto.id))}</id>
      <nombre>${this.escapeXml(item.producto.nombre)}</nombre>
      <cantidad>${item.cantidad}</cantidad>
      <precioUnitario>${item.producto.precio.toFixed(2)}</precioUnitario>
      <subtotal>${(item.producto.precio * item.cantidad).toFixed(2)}</subtotal>
    </articulo>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<cotizacion_factura>
  <numero>${this.escapeXml(folio)}</numero>
  <ordenPayPal>${this.escapeXml(orderId)}</ordenPayPal>
  <estado>COMPLETED</estado>
  <fecha>${new Date().toISOString()}</fecha>
  <emisor>
    <rfc>CYA123456789</rfc>
    <razonSocial>CYACO ERP Soluciones S.A. de C.V.</razonSocial>
    <direccionFiscal>Blvd. Tecnol\u00f3gico 456, C.P. 45000</direccionFiscal>
  </emisor>
  <receptor>
    <rfc>N/A</rfc>
    <razonSocial>${this.escapeXml(usuario?.empresa || 'Cliente particular')}</razonSocial>
    <contactoNombre>${this.escapeXml(usuario?.nombre || 'Cliente')}</contactoNombre>
    <contactoEmail>${this.escapeXml(usuario?.email || '')}</contactoEmail>
    <contactoTelefono>${this.escapeXml(usuario?.telefono || 'No registrado')}</contactoTelefono>
  </receptor>
  <detalles_pago>
    <metodoPago>PayPal</metodoPago>
    <moneda>MXN</moneda>
  </detalles_pago>
  <articulos>
${articulos}
  </articulos>
  <totales>
    <subtotal>${subtotalBase.toFixed(2)}</subtotal>
    <tasaIVA>16%</tasaIVA>
    <importeIVA>${importeIva.toFixed(2)}</importeIVA>
    <totalFactura>${totalFactura.toFixed(2)}</totalFactura>
  </totales>
</cotizacion_factura>`;
  }

  private generarFolioComprobante(orderId: string): string {
    const year = new Date().getFullYear();
    const shortId = orderId.slice(-6).toUpperCase();
    return `COMP-${year}-${shortId}`;
  }

  private mostrarModalPagoExitoso(datos: any[], orderId: string) {
    this.itemsPagados = [...datos];
    this.ordenPagadaId = orderId;
    const folio = this.generarFolioComprobante(orderId);
    this.nombreArchivoComprobante = `factura-cotizacion-${folio}.xml`;
    this.mostrarModalPago.set(true);
  }

  cerrarModal() {
    this.mostrarModalPago.set(false);
    this.itemsPagados = [];
    this.ordenPagadaId = '';
    this.nombreArchivoComprobante = '';
  }

  descargarComprobante(): void {
    if (!this.itemsPagados.length || !this.ordenPagadaId) {
      return;
    }

    this.descargarXML(this.itemsPagados, this.ordenPagadaId);
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

          const itemsGuardados = [...this.carrito()];
          console.log('Pago capturado:', capture);
          this.mensaje = 'Pago realizado correctamente.';
          this.mostrarModalPagoExitoso(itemsGuardados, data.orderID);
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

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
