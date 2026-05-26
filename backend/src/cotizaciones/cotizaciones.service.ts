import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoCotizacion, Prisma, RolUsuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CrearCotizacionDto } from './dto/crear-cotizacion.dto';

// pdfkit ships as CJS; use require for reliable constructor access
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');

@Injectable()
export class CotizacionesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly estadosPermitidos: EstadoCotizacion[] = [
    EstadoCotizacion.borrador,
    EstadoCotizacion.enviada,
    EstadoCotizacion.aceptada,
    EstadoCotizacion.rechazada,
    EstadoCotizacion.cancelada,
  ];

  async crear(usuarioId: number, dto: CrearCotizacionDto) {
    const productoIds = [...new Set(dto.items.map((item) => item.productoId))];
    const productos = await this.prisma.producto.findMany({
      where: { id: { in: productoIds }, activo: true },
      select: { id: true },
    });

    if (productos.length !== productoIds.length) {
      throw new BadRequestException('Uno o más productos no existen o están inactivos.');
    }

    const descuentoPct = dto.descuentoPct ?? 0;
    const margenPct = dto.margenPct ?? 0;

    if (descuentoPct > 100) {
      throw new BadRequestException('El descuento no puede ser mayor a 100%.');
    }

    const subtotal = dto.items.reduce((acc, item) => {
      return acc + item.cantidad * item.precioUnitario;
    }, 0);

    const totalConDescuento = subtotal - subtotal * (descuentoPct / 100);
    const total = totalConDescuento + totalConDescuento * (margenPct / 100);

    return this.prisma.$transaction(async (tx) => {
      const numero = await this.generarNumeroCotizacion(tx);

      const cotizacion = await tx.cotizacion.create({
        data: {
          numero,
          usuarioId,
          subtotal,
          descuentoPct,
          margenPct,
          total,
          observaciones: dto.observaciones?.trim() || null,
          contactoNombre: dto.contactoNombre?.trim() || null,
          contactoCorreo: dto.contactoCorreo?.trim().toLowerCase() || null,
          contactoTelefono: dto.contactoTelefono?.trim() || null,
          contactoCargo: dto.contactoCargo?.trim() || null,
          contactoEmpresa: dto.contactoEmpresa?.trim() || null,
          proyectoNombre: dto.proyectoNombre?.trim() || null,
          fechaRequerida: dto.fechaRequerida ? new Date(dto.fechaRequerida) : null,
          items: {
            create: dto.items.map((item) => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              subtotal: item.cantidad * item.precioUnitario,
            })),
          },
        },
        include: {
          items: {
            include: { producto: true },
          },
        },
      });

      return cotizacion;
    });
  }

  async generarPdfYXmlFromCotizacion(cotizacion: any): Promise<{ pdf: Buffer; xml: string; pdfFilename: string; xmlFilename: string }> {
    const esc = (texto: string) =>
      String(texto || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const iva = 0.16;
    const subtotalBase = (cotizacion.items || []).reduce((acc: number, item: any) => acc + (item.subtotal || 0), 0);
    const importeIva = parseFloat((subtotalBase * iva).toFixed(2));
    const totalFactura = parseFloat((subtotalBase + importeIva).toFixed(2));

    const articulos = (cotizacion.items || [])
      .map(
        (item: any) => `    <articulo>\n      <id>${item.id ?? ''}</id>\n      <nombre>${esc(item.producto?.nombre ?? '')}</nombre>\n      <cantidad>${item.cantidad}</cantidad>\n      <precioUnitario>${item.precioUnitario}</precioUnitario>\n      <subtotal>${item.subtotal}</subtotal>\n    </articulo>`,
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<cotizacion_factura>\n  <numero>${esc(cotizacion.numero)}</numero>\n  <fecha>${new Date(cotizacion.creadoEn).toISOString()}</fecha>\n  <emisor>\n    <rfc>CYA123456789</rfc>\n    <razonSocial>CYACO ERP Soluciones S.A. de C.V.</razonSocial>\n    <direccionFiscal>Blvd. Tecnol\u00f3gico 456, C.P. 45000</direccionFiscal>\n  </emisor>\n  <receptor>\n    <rfc>N/A</rfc>\n    <razonSocial>${esc(cotizacion.contacto?.empresa ?? 'N/A')}</razonSocial>\n    <direccionFiscal>N/A</direccionFiscal>\n    <contactoEmail>${esc(cotizacion.contacto?.correo ?? cotizacion.usuario?.email ?? '')}</contactoEmail>\n  </receptor>\n  <detalles_proyecto>\n    <nombre>${esc(cotizacion.proyecto?.nombre ?? 'Sin proyecto')}</nombre>\n    <fechaRequerida>${cotizacion.proyecto?.fechaRequerida ?? ''}</fechaRequerida>\n    <notas>${esc(cotizacion.observaciones ?? '')}</notas>\n  </detalles_proyecto>\n  <articulos>\n${articulos}\n  </articulos>\n  <totales>\n    <subtotal>${subtotalBase.toFixed(2)}</subtotal>\n    <tasaIVA>16%</tasaIVA>\n    <importeIVA>${importeIva.toFixed(2)}</importeIVA>\n    <totalFactura>${totalFactura.toFixed(2)}</totalFactura>\n  </totales>\n</cotizacion_factura>`;

    const pdfFilename = `cotizacion-${cotizacion.numero}.pdf`;
    const xmlFilename = `factura-cotizacion-${cotizacion.numero}.xml`;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve({ pdf: Buffer.concat(chunks), xml, pdfFilename, xmlFilename }));
      doc.on('error', reject);

      const formatMoney = (value: number) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(
          value,
        );

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text('Cyaco ERP', { align: 'left' });
      doc.moveDown(0.2);
      doc.fontSize(12).font('Helvetica').text(`Cotización ${cotizacion.numero}`, { align: 'left' });
      doc.moveDown(0.5);

      // Emisor / Receptor
      doc.fontSize(9).font('Helvetica-Bold').text('Emisor:');
      doc.font('Helvetica').text('CYACO ERP Soluciones S.A. de C.V.');
      doc.moveDown(0.3);

      doc.font('Helvetica-Bold').text('Receptor:');
      const receptorLine = `${cotizacion.contacto?.empresa || 'N/A'} — ${cotizacion.contacto?.nombreCompleto || ''}`;
      doc.font('Helvetica').text(receptorLine);
      doc.text(`Correo: ${cotizacion.contacto?.correo ?? cotizacion.usuario?.email ?? 'N/A'}`);
      doc.moveDown(0.5);

      // Proyecto / Observaciones
      doc.font('Helvetica-Bold').text('Detalles del proyecto:');
      doc.font('Helvetica').text(`Proyecto: ${cotizacion.proyecto?.nombre ?? 'Sin proyecto'}`);
      doc.text(`Fecha requerida: ${cotizacion.proyecto?.fechaRequerida ?? 'N/A'}`);
      doc.text(`Observaciones: ${cotizacion.observaciones ?? 'Sin observaciones.'}`);
      doc.moveDown(0.5);

      // Table header (monospace for alignment)
      doc.font('Courier-Bold').fontSize(9);
      const header = `${'#'.padEnd(4)}${'ID'.padEnd(8)}${'Producto'.padEnd(40)}${'Cant'.padEnd(6)}${'Precio U.'.padEnd(14)}${'Subtotal'.padEnd(12)}`;
      doc.text(header);
      doc.font('Courier').fontSize(9);

      (cotizacion.items || []).forEach((item: any, idx: number) => {
        const id = String(item.id ?? '—').padEnd(8);
        const prod = String(item.producto?.nombre ?? 'Sin nombre').padEnd(40).substring(0, 40);
        const cant = String(item.cantidad).padEnd(6);
        const precio = formatMoney(item.precioUnitario).padEnd(14);
        const sub = formatMoney(item.subtotal).padEnd(12);
        const row = `${String(idx + 1).padEnd(4)}${id}${prod}${cant}${precio}${sub}`;
        doc.text(row);
      });

      doc.moveDown(0.5);
      doc.font('Helvetica-Bold').fontSize(10).text(`Subtotal: ${formatMoney(subtotalBase)}`, { align: 'right' });
      doc.font('Helvetica').text(`IVA (16%): ${formatMoney(importeIva)}`, { align: 'right' });
      doc.font('Helvetica-Bold').text(`Total: ${formatMoney(totalFactura)}`, { align: 'right' });

      doc.moveDown(0.8);
      doc.font('Helvetica').fontSize(8).text('* Documento generado automáticamente por Cyaco ERP.', { align: 'left' });

      // Add a readable summary of the same data that we embed in the XML
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(12).text('Datos incluidos en el XML (resumen)', { align: 'left' });
      doc.moveDown(0.3);

      doc.font('Helvetica-Bold').fontSize(10).text('Número: ');
      doc.font('Helvetica').fontSize(10).text(String(cotizacion.numero));
      doc.moveDown(0.2);

      doc.font('Helvetica-Bold').text('Fecha:');
      doc.font('Helvetica').text(new Date(cotizacion.creadoEn).toISOString());
      doc.moveDown(0.3);

      doc.font('Helvetica-Bold').text('Emisor:');
      doc.font('Helvetica').text(`RFC: CYA123456789`);
      doc.text('Razón social: CYACO ERP Soluciones S.A. de C.V.');
      doc.text('Dirección fiscal: Blvd. Tecnológico 456, C.P. 45000');
      doc.moveDown(0.3);

      doc.font('Helvetica-Bold').text('Receptor:');
      doc.font('Helvetica').text(`Razón social: ${cotizacion.contacto?.empresa ?? 'N/A'}`);
      doc.text(`Contacto: ${cotizacion.contacto?.nombreCompleto ?? ''}`);
      if (cotizacion.contacto?.cargo) {
        doc.text(`Cargo: ${cotizacion.contacto.cargo}`);
      }
      if (cotizacion.contacto?.telefono) {
        doc.text(`Teléfono: ${cotizacion.contacto.telefono}`);
      }
      doc.text(`Correo: ${cotizacion.contacto?.correo ?? cotizacion.usuario?.email ?? 'N/A'}`);
      doc.moveDown(0.3);

      doc.font('Helvetica-Bold').text('Detalles del proyecto:');
      doc.font('Helvetica').text(`Nombre: ${cotizacion.proyecto?.nombre ?? 'Sin proyecto'}`);
      doc.text(`Fecha requerida: ${cotizacion.proyecto?.fechaRequerida ?? 'N/A'}`);
      doc.text(`Notas: ${cotizacion.observaciones ?? ''}`);
      doc.moveDown(0.3);

      doc.font('Helvetica-Bold').text('Artículos:');
      doc.moveDown(0.2);
      doc.font('Helvetica').fontSize(9);
      (cotizacion.items || []).forEach((item: any, idx: number) => {
        doc.text(`${idx + 1}. ID: ${item.id ?? ''} — ${item.producto?.nombre ?? 'Sin nombre'}`);
        doc.text(`   Cantidad: ${item.cantidad}   Precio unitario: ${formatMoney(item.precioUnitario)}   Subtotal: ${formatMoney(item.subtotal)}`);
        doc.moveDown(0.1);
      });

      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').text('Totales:');
      doc.font('Helvetica').text(`Subtotal: ${formatMoney(subtotalBase)}`);
      doc.text(`Tasa IVA: 16%`);
      doc.text(`Importe IVA: ${formatMoney(importeIva)}`);
      doc.text(`Total factura: ${formatMoney(totalFactura)}`);

      // Finally include the raw XML as an annex for completeness
      doc.addPage();
      doc.font('Helvetica-Bold').fontSize(12).text('Datos XML (anexo)', { align: 'left' });
      doc.moveDown(0.5);
      doc.font('Courier').fontSize(8).text(xml, { width: 510 });

      doc.end();
    });
  }

  async listarPropias(usuarioId: number) {
    return this.prisma.cotizacion.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: 'desc' },
      include: {
        items: {
          include: { producto: true },
        },
      },
    });
  }

  async listarTodas(filtros?: {
    estado?: string;
    desde?: string;
    hasta?: string;
    cliente?: string;
  }) {
    const where: Prisma.CotizacionWhereInput = {};

    const estado = filtros?.estado?.trim();
    if (estado) {
      if (!this.estadosPermitidos.includes(estado as EstadoCotizacion)) {
        throw new BadRequestException('El estado de cotización enviado no es válido.');
      }
      where.estado = estado as EstadoCotizacion;
    }

    const cliente = filtros?.cliente?.trim();
    if (cliente) {
      where.OR = [
        { contactoEmpresa: { contains: cliente } },
        { contactoNombre: { contains: cliente } },
        { usuario: { nombre: { contains: cliente } } },
        { usuario: { email: { contains: cliente } } },
      ];
    }

    const desde = filtros?.desde?.trim();
    const hasta = filtros?.hasta?.trim();
    if (desde || hasta) {
      where.creadoEn = {};
      if (desde) {
        const fechaDesde = new Date(`${desde}T00:00:00.000Z`);
        if (Number.isNaN(fechaDesde.getTime())) {
          throw new BadRequestException('La fecha "desde" no es válida.');
        }
        where.creadoEn.gte = fechaDesde;
      }

      if (hasta) {
        const fechaHasta = new Date(`${hasta}T23:59:59.999Z`);
        if (Number.isNaN(fechaHasta.getTime())) {
          throw new BadRequestException('La fecha "hasta" no es válida.');
        }
        where.creadoEn.lte = fechaHasta;
      }
    }

    return this.prisma.cotizacion.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      include: {
        usuario: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
        items: {
          include: { producto: true },
        },
      },
    });
  }

  async obtenerPorId(id: number, usuarioId: number, rol: RolUsuario) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nombre: true, email: true, rol: true },
        },
        items: {
          include: { producto: true },
        },
      },
    });

    if (!cotizacion) {
      throw new NotFoundException(`Cotización ${id} no encontrada.`);
    }

    if (rol !== RolUsuario.admin && cotizacion.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes permiso para consultar esta cotización.');
    }

    return cotizacion;
  }

  async actualizarEstado(id: number, estado: EstadoCotizacion, usuarioId: number, rol: RolUsuario) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!cotizacion) {
      throw new NotFoundException(`Cotización ${id} no encontrada.`);
    }

    const esAdmin = rol === RolUsuario.admin;
    const esPropietario = cotizacion.usuarioId === usuarioId;
    if (!esAdmin && !esPropietario) {
      throw new ForbiddenException('No tienes permiso para modificar esta cotización.');
    }

    if (!esAdmin && estado !== EstadoCotizacion.enviada && estado !== EstadoCotizacion.cancelada) {
      throw new ForbiddenException('Solo un admin puede aceptar o rechazar cotizaciones.');
    }

    // No-op: already in the desired state
    if (estado === cotizacion.estado) {
      return cotizacion;
    }

    // Accepting: validate stock and decrement inventory
    if (estado === EstadoCotizacion.aceptada) {
      return this.prisma.$transaction(async (tx) => {
        for (const item of cotizacion.items) {
          const producto = await tx.producto.findUnique({ where: { id: item.productoId } });
          if (!producto || !producto.activo) {
            throw new BadRequestException(
              `El producto ${item.productoId} no existe o está inactivo.`,
            );
          }
          if (producto.stock < item.cantidad) {
            throw new BadRequestException(
              `Stock insuficiente para ${producto.nombre}: disponible ${producto.stock}, solicitado ${item.cantidad}.`,
            );
          }
        }

        for (const item of cotizacion.items) {
          await tx.producto.update({
            where: { id: item.productoId },
            data: { stock: { decrement: item.cantidad } },
          });
        }

        return tx.cotizacion.update({
          where: { id },
          data: { estado },
          include: {
            items: { include: { producto: true } },
          },
        });
      });
    }

    // Moving away from aceptada: restore inventory
    if (cotizacion.estado === EstadoCotizacion.aceptada) {
      return this.prisma.$transaction(async (tx) => {
        for (const item of cotizacion.items) {
          await tx.producto.update({
            where: { id: item.productoId },
            data: { stock: { increment: item.cantidad } },
          });
        }

        return tx.cotizacion.update({
          where: { id },
          data: {
            estado,
            ...(estado === EstadoCotizacion.enviada ? { enviadoEn: new Date() } : {}),
          },
        });
      });
    }

    return this.prisma.cotizacion.update({
      where: { id },
      data: {
        estado,
        ...(estado === EstadoCotizacion.enviada ? { enviadoEn: new Date() } : {}),
      },
    });
  }

  async actualizarPreciosYDescuentos(
    id: number,
    descuentoPct?: number,
    margenPct?: number,
    preciosItems?: Array<{ itemId: number; precioUnitario: number }>,
    usuarioId?: number,
    rol?: RolUsuario,
  ) {
    const cotizacion = await this.prisma.cotizacion.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!cotizacion) {
      throw new NotFoundException(`Cotización ${id} no encontrada.`);
    }

    // Validar permiso
    if (rol && usuarioId) {
      const esAdmin = rol === RolUsuario.admin;
      const esPropietario = cotizacion.usuarioId === usuarioId;
      if (!esAdmin && !esPropietario) {
        throw new ForbiddenException('No tienes permiso para modificar esta cotización.');
      }
    }

    // No permitir editar cotizaciones aceptadas o rechazadas
    if (
      cotizacion.estado === EstadoCotizacion.aceptada ||
      cotizacion.estado === EstadoCotizacion.rechazada
    ) {
      throw new BadRequestException('No se pueden editar cotizaciones aceptadas o rechazadas.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Actualizar precios unitarios de items si se proporcionan
      if (preciosItems && preciosItems.length > 0) {
        for (const itemUpdate of preciosItems) {
          const item = cotizacion.items.find((i) => i.id === itemUpdate.itemId);
          if (!item) {
            throw new BadRequestException(`Item ${itemUpdate.itemId} no encontrado.`);
          }

          const nuevoSubtotal = itemUpdate.precioUnitario * item.cantidad;

          await tx.itemCotizacion.update({
            where: { id: itemUpdate.itemId },
            data: {
              precioUnitario: itemUpdate.precioUnitario,
              subtotal: nuevoSubtotal,
            },
          });
        }
      }

      // Recalcular subtotal total
      const itemsActualizados = await tx.itemCotizacion.findMany({
        where: { cotizacionId: id },
      });

      const nuevoSubtotal = itemsActualizados.reduce((acc, item) => acc + item.subtotal, 0);

      // Aplicar descuento y margen
      const descto = descuentoPct ?? cotizacion.descuentoPct;
      const margen = margenPct ?? cotizacion.margenPct;

      const totalConDescuento = nuevoSubtotal - nuevoSubtotal * (descto / 100);
      const nuevoTotal = totalConDescuento + totalConDescuento * (margen / 100);

      return tx.cotizacion.update({
        where: { id },
        data: {
          subtotal: nuevoSubtotal,
          descuentoPct: descto,
          margenPct: margen,
          total: nuevoTotal,
        },
        include: { items: { include: { producto: true } } },
      });
    });
  }

  private async generarNumeroCotizacion(tx: Prisma.TransactionClient): Promise<string> {
    const anio = new Date().getFullYear();
    const inicioAnio = new Date(`${anio}-01-01T00:00:00.000Z`);

    const count = await tx.cotizacion.count({
      where: {
        creadoEn: {
          gte: inicioAnio,
        },
      },
    });

    const consecutivo = String(count + 1).padStart(4, '0');
    return `COT-${anio}-${consecutivo}`;
  }
}
