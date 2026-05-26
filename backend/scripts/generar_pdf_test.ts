import fs from 'fs';
import path from 'path';
import { CotizacionesService } from '../src/cotizaciones/cotizaciones.service';
// PrismaService is not needed for this test; pass a dummy object
import { PrismaService } from '../src/prisma/prisma.service';

async function main() {
  // Build a cotizacion object based on the attached XML example
  const cotizacion: any = {
    numero: 'COT-2026-0006',
    creadoEn: new Date('2026-05-05T23:46:24.623Z'),
    contacto: {
      empresa: 'PEMEX',
      nombreCompleto: '',
      correo: 'leosanchez1612@gmail.com',
      telefono: undefined,
      cargo: undefined,
    },
    proyecto: {
      nombre: 'Pro',
      fechaRequerida: '2026-05-05T00:00:00.000Z',
    },
    observaciones: '3r23tewq3r',
    items: [
      {
        id: 15,
        cantidad: 1,
        precioUnitario: 12500,
        subtotal: 12500,
        producto: { nombre: 'Transmisor Presion X100', categoria: { nombre: 'Instrumentacion' } },
      },
      {
        id: 16,
        cantidad: 2,
        precioUnitario: 18900,
        subtotal: 37800,
        producto: { nombre: 'Transmisor Presion X300', categoria: { nombre: 'Instrumentacion' } },
      },
    ],
    usuario: undefined,
  };

  const svc = new CotizacionesService({} as PrismaService);

  try {
    const { pdf, xml, pdfFilename, xmlFilename } = await svc.generarPdfYXmlFromCotizacion(cotizacion);
    const outPdf = path.join(process.cwd(), pdfFilename || 'cotizacion-test.pdf');
    const outXml = path.join(process.cwd(), xmlFilename || 'cotizacion-test.xml');
    fs.writeFileSync(outPdf, pdf);
    fs.writeFileSync(outXml, xml);
    console.log('Generado PDF:', outPdf);
    console.log('Generado XML:', outXml);
  } catch (err) {
    console.error('Error generando PDF/XML:', err);
    process.exitCode = 1;
  }
}

main();
