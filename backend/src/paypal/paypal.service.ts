import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaypalService {
  constructor(private readonly prisma: PrismaService) {}

  private get config() {
    return {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      baseUrl: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
    };
  }

  private getBasicAuth() {
    return Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString('base64');
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${this.getBasicAuth()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (!data.access_token) {
      throw new InternalServerErrorException('No se pudo obtener access token de PayPal');
    }

    return data.access_token;
  }

  async createOrder(items: any[]) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const accessToken = await this.getAccessToken();

    const ids = items.map((i) => i.producto.id);

    const productos = await this.prisma.producto.findMany({
      where: {
        id: { in: ids },
        activo: true,
      },
    });

    if (!productos.length) {
      throw new BadRequestException('No se encontraron productos válidos');
    }

    let total = 0;

    for (const item of items) {
      const producto = productos.find((p) => p.id === item.producto.id);

      if (!producto) {
        throw new BadRequestException(`Producto inválido: ${item.producto.id}`);
      }

      if (item.cantidad <= 0) {
        throw new BadRequestException(
          `Cantidad inválida para producto ${item.producto.id}`,
        );
      }

      if (producto.stock < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${producto.nombre}`,
        );
      }

      total += Number(producto.precio) * item.cantidad;
    }

    const response = await fetch(`${this.config.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'MXN',
              value: total.toFixed(2),
            },
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.id) {
      throw new InternalServerErrorException('PayPal no devolvió una orden válida');
    }

    return {
      id: data.id,
      status: data.status,
    };
  }

  async captureOrder(orderId: string) {
    if (!orderId) {
      throw new BadRequestException('orderId es obligatorio');
    }

    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${this.config.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.json();
  }
}