import { Body, Controller, Post } from '@nestjs/common';
import { PaypalService } from './paypal.service';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post('create-order')
  createOrder(@Body() body: { items: any[] }) {
    return this.paypalService.createOrder(body.items);
  }

  @Post('capture-order')
  captureOrder(@Body() body: { orderId: string }) {
    return this.paypalService.captureOrder(body.orderId);
  }
}