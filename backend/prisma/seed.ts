import { PrismaClient, RolUsuario, EstadoCotizacion, EstadoProyecto, EstadoTareaProyecto } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const imagePool = [
  '/assets/images/photo-1672689956124-18666b4cdae4.jpg',
  '/assets/images/photo-1689942007858-7b12bf5864bd.jpg',
  '/assets/images/photo-1761758674188-2b8e4c89c5e2.jpg',
  '/assets/images/photo-1763889107827-8e7d7960d68a.jpg',
  '/assets/images/photo-1766325693346-6279a63b1fba.jpg',
];

type ProductoSeed = {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  fabricante: string;
  numeroParte: string;
  familia: string;
  especificacionesTecnicas: Record<string, string>;
};

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@cyaco.local').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin1234!';
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {
      nombre: 'Administrador CYACO',
      passwordHash: adminHash,
      rol: RolUsuario.admin,
      activo: true,
    },
    create: {
      nombre: 'Administrador CYACO',
      email: adminEmail,
      passwordHash: adminHash,
      rol: RolUsuario.admin,
      activo: true,
      empresa: 'CYACO ERP',
      cargo: 'Administrador General',
    },
  });

  const usuariosCliente = [
    ['maria.lopez@industrias-nova.com', 'Maria Lopez', '+52 81 0000 0000', 'Industrias Nova', 'Gerente de Planta'],
    ['carlos.ramirez@petroval.mx', 'Carlos Ramirez', '+52 81 1000 0001', 'Petroval', 'Jefe de Instrumentacion'],
    ['ana.soto@aquaflow.com', 'Ana Soto', '+52 81 1000 0002', 'AquaFlow', 'Compras Tecnicas'],
    ['javier.ponce@cementa.com', 'Javier Ponce', '+52 81 1000 0003', 'Cementa', 'Mantenimiento'],
    ['lucia.mendez@enertek.com', 'Lucia Mendez', '+52 81 1000 0004', 'Enertek', 'Ingenieria de Proyectos'],
  ] as const;

  for (const [email, nombre, telefono, empresa, cargo] of usuariosCliente) {
    const hash = await bcrypt.hash('Cliente123!', 10);
    await prisma.usuario.upsert({
      where: { email },
      update: { nombre, telefono, empresa, cargo, passwordHash: hash, rol: RolUsuario.cliente, activo: true },
      create: { nombre, email, telefono, empresa, cargo, passwordHash: hash, rol: RolUsuario.cliente, activo: true },
    });
  }

  const clientes = [
    ['Industrias Nova SA de CV', 'INO010101A11', '44100', 'Manufactura'],
    ['Petroval Operaciones', 'PET020202B22', '45010', 'Oil & Gas'],
    ['AquaFlow Soluciones', 'AQU030303C33', '45020', 'Tratamiento de agua'],
    ['Cementa del Norte', 'CEM040404D44', '45030', 'Cemento'],
    ['Enertek Proyectos', 'ENE050505E55', '45040', 'Energia'],
    ['Quimica Atlas', 'QUI060606F66', '45050', 'Quimica'],
    ['MetalMec Industrial', 'MET070707G77', '45060', 'Metal mecánica'],
    ['Logisur Terminales', 'LOG080808H88', '45070', 'Logistica'],
    ['BioFood Process', 'BIO090909I99', '45080', 'Alimentos'],
    ['Papeles Delta', 'PAP101010J10', '45090', 'Papel'],
  ] as const;

  for (const [razonSocial, rfc, codigoPostal, sector] of clientes) {
    await prisma.cliente.upsert({
      where: { rfc },
      update: { razonSocial, codigoPostal, sector, activo: true },
      create: { razonSocial, rfc, codigoPostal, sector, activo: true },
    });
  }

  const categorias = [
    ['Presion', 'Instrumentos de presión industrial'],
    ['Flujo', 'Medicion y control de flujo'],
    ['Temperatura', 'Sensores y transmisores de temperatura'],
    ['Nivel', 'Control y monitoreo de nivel'],
    ['Valvulas', 'Valvulas de control y actuadores'],
    ['Comunicacion', 'Gateways y redes industriales'],
    ['Seguridad', 'Equipos para areas peligrosas'],
    ['Analitica', 'Instrumentos analiticos de proceso'],
  ] as const;

  for (const [nombre, descripcion] of categorias) {
    await prisma.categoria.upsert({
      where: { nombre },
      update: { descripcion },
      create: { nombre, descripcion },
    });
  }

  const categoriasDb = await prisma.categoria.findMany();
  const categoriaPorNombre = new Map(categoriasDb.map((c) => [c.nombre, c.id]));

  const fichasTecnicasPorCategoria: Record<string, string> = {
    Presion: 'https://www.emerson.com/en/final-control/catalog/products-and-software/pressure-regulators/pressure-reducing-regulators#perPage=15&sortCriteria=relevance',
    Flujo: 'https://www.endress.com/en/field-instruments-overview/flow-measurement-product-overview',
    Temperatura: 'https://www.endress.com/en/field-instruments-overview/temperature-measurement-product-overview',
    Nivel: 'https://www.emerson.com/en/final-control/catalog/products-and-software/valve-actuator-regulator-instrumentation/level-controllers#perPage=15&sortCriteria=relevance',
    Valvulas: 'https://www.emerson.com/en/final-control/products/bettis-v4b',
    Comunicacion: 'https://www.siemens.com/global/en/products/automation/industrial-communication.html',
    Seguridad: 'https://www.msasafety.com/',
    Analitica: 'https://www.endress.com/en/field-instruments-overview/analysis-product-overview',
  };

  const fichasTecnicasPorProducto: Record<string, string> = {
    'Transmisor Presion X100': 'https://www.emerson.com/en/final-control/catalog/products-and-software/pressure-regulators/back-pressure-regulators#perPage=15&sortCriteria=relevance',
    'Transmisor Presion X300': 'https://www.emerson.com/en/final-control/catalog/products-and-software/pressure-regulators/pressure-reducing-regulators#perPage=15&sortCriteria=relevance',
    'Manometro Digital DPM-45': 'https://www.emerson.com/en/final-control/catalog/products-and-software/pressure-regulators/back-pressure-regulators#perPage=15&sortCriteria=relevance',
    'Radar Nivel RN-40': 'https://www.emerson.com/is/content/emerson/en/final-control/flow-controls/documents/d103219x012.pdf',
    'Ultrasonico Nivel UL-25': 'https://www.emerson.com/is/content/emerson/en/final-control/flow-controls/documents/d103219x012.pdf',
    'Interruptor Nivel LN-2': 'https://www.emerson.com/is/content/emerson/en/final-control/flow-controls/documents/d103219x012.pdf',
    'Valvula Control VC-4': 'https://www.emerson.com/is/content/emerson/en/final-control/actuation/documents/product-brochure-gvo-series-linear-valve-operators-imperial-data-bettis-en.pdf',
    'Actuador Neumatico AN-90': 'https://www.emerson.com/is/content/emerson/en/final-control/actuation/documents/data-sheets-gvo-g-series-p-da-sr-thrust-chart-metric-bettis-en.pdf',
    'Posicionador Inteligente PI-12': 'https://www.emerson.com/is/content/emerson/en/final-control/actuation/documents/brochure-bettis-product-selection-guide-us.pdf',
  };

  const productosSeed: ProductoSeed[] = [
    { nombre: 'Transmisor Presion X100', descripcion: 'Rango 0-100 bar, salida 4-20mA, acero inoxidable', precio: 12500, stock: 18, categoria: 'Presion', fabricante: 'Endress+Hauser', numeroParte: 'PMP11-X100', familia: 'Cerabar', especificacionesTecnicas: { rango: '0-100 bar', senalSalida: '4-20 mA', alimentacion: '24 VDC', precision: '0.25 % FS' } },
    { nombre: 'Transmisor Presion X300', descripcion: 'Alta precision para procesos criticos, HART', precio: 18900, stock: 12, categoria: 'Presion', fabricante: 'Endress+Hauser', numeroParte: 'PMP51-X300', familia: 'Cerabar', especificacionesTecnicas: { rango: '0-250 bar', protocolo: 'HART', material: 'AISI 316L', precision: '0.1 % FS' } },
    { nombre: 'Manometro Digital DPM-45', descripcion: 'Display retroiluminado, IP65', precio: 4200, stock: 25, categoria: 'Presion', fabricante: 'WIKA', numeroParte: 'DPM-45', familia: 'Digital Pressure Gauge', especificacionesTecnicas: { rango: '0-16 bar', proteccion: 'IP65', display: 'LCD retroiluminado', conexion: '1/4 NPT' } },
    { nombre: 'Caudalimetro Electromagnetico EM-200', descripcion: 'Medicion de flujo en agua y lodos', precio: 26500, stock: 9, categoria: 'Flujo', fabricante: 'Yokogawa', numeroParte: 'AXF-EM200', familia: 'AXF', especificacionesTecnicas: { diametro: '2 in', precision: '0.5 % lectura', fluido: 'Conductivo', protocolo: 'HART / Modbus' } },
    { nombre: 'Caudalimetro Ultrasónico UF-90', descripcion: 'Clamp-on, instalacion sin corte de linea', precio: 31800, stock: 7, categoria: 'Flujo', fabricante: 'Yokogawa', numeroParte: 'UF-90', familia: 'Ultrasonic', especificacionesTecnicas: { tecnologia: 'Ultrasonido clamp-on', diametro: '1-24 in', precision: '1 % lectura', salida: '4-20 mA' } },
    { nombre: 'Sensor Flujo Turbina TF-22', descripcion: 'Bajo costo para fluidos limpios', precio: 7300, stock: 20, categoria: 'Flujo', fabricante: 'Krohne', numeroParte: 'TF-22', familia: 'Turbine', especificacionesTecnicas: { rangoFlujo: '5-120 L/min', conexion: '1 in', cuerpo: 'Acero inoxidable', precision: '1.5 % FS' } },
    { nombre: 'RTD PT100 Pro', descripcion: 'Sonda industrial clase A', precio: 2500, stock: 32, categoria: 'Temperatura', fabricante: 'Endress+Hauser', numeroParte: 'TM311-PT100', familia: 'iTHERM', especificacionesTecnicas: { sensor: 'PT100 Clase A', rango: '-50 a 250 C', conexion: '1/2 NPT', longitud: '150 mm' } },
    { nombre: 'Termopar Tipo K TK-900', descripcion: 'Alta temperatura hasta 1200C', precio: 2900, stock: 28, categoria: 'Temperatura', fabricante: 'Omega', numeroParte: 'TK-900', familia: 'Thermocouple', especificacionesTecnicas: { tipo: 'Termopar K', rango: '0 a 1200 C', vaina: 'Inconel', diametro: '6 mm' } },
    { nombre: 'Transmisor Temperatura TT-8', descripcion: 'Entrada universal, salida HART', precio: 8600, stock: 15, categoria: 'Temperatura', fabricante: 'Endress+Hauser', numeroParte: 'TMT82', familia: 'iTEMP', especificacionesTecnicas: { entrada: 'RTD/TC universal', salida: '4-20 mA HART', precision: '0.05 %', alimentacion: '24 VDC' } },
    { nombre: 'Radar Nivel RN-40', descripcion: 'Medicion continua para tanques', precio: 34500, stock: 6, categoria: 'Nivel', fabricante: 'VEGA', numeroParte: 'VEGAPULS-RN40', familia: 'VEGAPULS', especificacionesTecnicas: { tecnologia: 'Radar 80 GHz', rango: 'Hasta 30 m', salida: '4-20 mA HART', proteccion: 'IP68' } },
    { nombre: 'Ultrasonico Nivel UL-25', descripcion: 'Control de nivel no contacto', precio: 14500, stock: 11, categoria: 'Nivel', fabricante: 'VEGA', numeroParte: 'UL-25', familia: 'Ultrasonic', especificacionesTecnicas: { tecnologia: 'Ultrasonido', rango: '0.3-15 m', precision: '0.25 %', proteccion: 'IP66' } },
    { nombre: 'Interruptor Nivel LN-2', descripcion: 'Punto alto/bajo para tanques', precio: 3900, stock: 30, categoria: 'Nivel', fabricante: 'Endress+Hauser', numeroParte: 'LN-2', familia: 'Liquiphant', especificacionesTecnicas: { tipo: 'Interruptor vibratorio', salida: 'PNP/relay', temperatura: '-40 a 100 C', presionMax: '40 bar' } },
    { nombre: 'Valvula Control VC-4', descripcion: 'Valvula globo actuada 2 pulgadas', precio: 22500, stock: 8, categoria: 'Valvulas', fabricante: 'Fisher', numeroParte: 'VC-4', familia: 'Control Valve', especificacionesTecnicas: { diametro: '2 in', tipo: 'Globo', material: 'Acero al carbono', clase: 'ANSI 300' } },
    { nombre: 'Actuador Neumatico AN-90', descripcion: 'Accionamiento para valvulas de proceso', precio: 11900, stock: 16, categoria: 'Valvulas', fabricante: 'Fisher', numeroParte: 'AN-90', familia: 'Pneumatic Actuator', especificacionesTecnicas: { accionamiento: 'Neumático', torque: '90 Nm', presionOperacion: '3-8 bar', material: 'Aluminio anodizado' } },
    { nombre: 'Posicionador Inteligente PI-12', descripcion: 'Precision de posicion con diagnostico', precio: 9800, stock: 13, categoria: 'Valvulas', fabricante: 'Fisher', numeroParte: 'DVC6200-PI12', familia: 'FIELDVUE', especificacionesTecnicas: { protocolo: 'HART', precision: '0.5 %', diagnostico: 'Avanzado', alimentacion: 'Loop-powered' } },
    { nombre: 'Gateway Industrial GW-500', descripcion: 'Conversor Modbus TCP/RTU', precio: 8700, stock: 17, categoria: 'Comunicacion', fabricante: 'Siemens', numeroParte: 'GW-500', familia: 'Industrial Gateway', especificacionesTecnicas: { puertos: '2x Ethernet + 1x RS-485', protocolo: 'Modbus TCP/RTU', montaje: 'Riel DIN', temperatura: '-20 a 70 C' } },
    { nombre: 'Switch Industrial SW-8', descripcion: '8 puertos ethernet, riel DIN', precio: 6100, stock: 21, categoria: 'Comunicacion', fabricante: 'Siemens', numeroParte: 'SCALANCE-SW8', familia: 'SCALANCE', especificacionesTecnicas: { puertos: '8x 10/100Base-TX', gestion: 'No administrable', montaje: 'DIN rail', proteccion: 'IP30' } },
    { nombre: 'Módem LTE Industrial LT-100', descripcion: 'Conectividad remota segura para SCADA', precio: 10500, stock: 10, categoria: 'Comunicacion', fabricante: 'Moxa', numeroParte: 'OnCell-LT100', familia: 'OnCell', especificacionesTecnicas: { red: 'LTE Cat 4', vpn: 'IPSec/OpenVPN', puertos: '2x Ethernet', alimentacion: '12-48 VDC' } },
    { nombre: 'Detector Gas DG-77', descripcion: 'Deteccion de gases combustibles', precio: 21300, stock: 9, categoria: 'Seguridad', fabricante: 'MSA', numeroParte: 'DG-77', familia: 'Gas Detector', especificacionesTecnicas: { gas: 'Combustible (LEL)', salida: '4-20 mA', certificacion: 'ATEX/IECEx', proteccion: 'IP66' } },
    { nombre: 'Barreras Intrinsecas BI-4', descripcion: 'Proteccion para lazo en zona peligrosa', precio: 7900, stock: 18, categoria: 'Seguridad', fabricante: 'MSA', numeroParte: 'BI-4', familia: 'Intrinsic Safety', especificacionesTecnicas: { canales: '4', aislamiento: 'Galvánico', certificacion: 'SIL2', montaje: 'Riel DIN' } },
    { nombre: 'Caja ATEX CA-2', descripcion: 'Encapsulado para instrumentacion en campo', precio: 5200, stock: 22, categoria: 'Seguridad', fabricante: 'MSA', numeroParte: 'CA-2', familia: 'ATEX Enclosure', especificacionesTecnicas: { material: 'Aluminio', certificacion: 'ATEX Zona 1', entradas: '4x M20', proteccion: 'IP67' } },
    { nombre: 'Analizador pH APH-300', descripcion: 'Monitoreo continuo de pH en linea', precio: 19800, stock: 8, categoria: 'Analitica', fabricante: 'Endress+Hauser', numeroParte: 'APH-300', familia: 'Liquiline', especificacionesTecnicas: { parametro: 'pH', rango: '0-14 pH', salida: '4-20 mA / Modbus', precision: '0.01 pH' } },
    { nombre: 'Analizador Conductividad AC-11', descripcion: 'Control de calidad de agua de proceso', precio: 16400, stock: 12, categoria: 'Analitica', fabricante: 'Endress+Hauser', numeroParte: 'AC-11', familia: 'Liquiline', especificacionesTecnicas: { parametro: 'Conductividad', rango: '0-200 mS/cm', salida: '4-20 mA', precision: '1 % lectura' } },
    { nombre: 'Oxigeno Disuelto OD-7', descripcion: 'Sensor optico para tratamiento de agua', precio: 23800, stock: 5, categoria: 'Analitica', fabricante: 'Endress+Hauser', numeroParte: 'OD-7', familia: 'COS61D', especificacionesTecnicas: { parametro: 'Oxígeno disuelto', rango: '0-20 mg/L', tecnologia: 'Óptico', mantenimiento: 'Bajo' } },
  ];

  for (let i = 0; i < productosSeed.length; i += 1) {
    const p = productosSeed[i];
    const categoriaId = categoriaPorNombre.get(p.categoria);
    if (!categoriaId) continue;

    const existente = await prisma.producto.findFirst({
      where: { nombre: p.nombre, categoriaId },
    });

    const imagenUrl = imagePool[i % imagePool.length];
    const urlDocumento =
      fichasTecnicasPorProducto[p.nombre] ??
      fichasTecnicasPorCategoria[p.categoria] ??
      '/uploads/documentos/ficha-general.pdf';

    if (existente) {
      await prisma.producto.update({
        where: { id: existente.id },
        data: {
          descripcion: p.descripcion,
          fabricante: p.fabricante,
          numeroParte: p.numeroParte,
          skuInterno: `SKU-${(i + 1).toString().padStart(4, '0')}`,
          familia: p.familia,
          especificacionesTecnicas: p.especificacionesTecnicas,
          precio: p.precio,
          stock: p.stock,
          imagenUrl,
          urlDocumento,
          activo: true,
        },
      });
    } else {
      await prisma.producto.create({
        data: {
          nombre: p.nombre,
          descripcion: p.descripcion,
          fabricante: p.fabricante,
          numeroParte: p.numeroParte,
          skuInterno: `SKU-${(i + 1).toString().padStart(4, '0')}`,
          familia: p.familia,
          especificacionesTecnicas: p.especificacionesTecnicas,
          precio: p.precio,
          stock: p.stock,
          categoriaId,
          imagenUrl,
          urlDocumento,
          activo: true,
        },
      });
    }
  }

  const usuarios = await prisma.usuario.findMany({ where: { rol: RolUsuario.cliente } });
  const usuarioPorEmail = new Map(usuarios.map((u) => [u.email, u.id]));

  const productosActivos = await prisma.producto.findMany({
    where: { activo: true },
    select: { id: true, nombre: true },
    orderBy: { id: 'asc' },
  });
  const idPorNombre = new Map(productosActivos.map((p) => [p.nombre, p.id]));

  await prisma.compatibilidadProducto.deleteMany({});

  const compatibilidadesSeed = [
    ['Actuador Neumatico AN-90', 'Valvula Control VC-4', 'compatible', 'Integración mecánica recomendada'],
    ['Actuador Neumatico AN-90', 'Posicionador Inteligente PI-12', 'compatible', 'Control preciso de posicionamiento'],
    ['Valvula Control VC-4', 'Posicionador Inteligente PI-12', 'compatible', 'Par recomendado para lazo de control'],
    ['Transmisor Temperatura TT-8', 'RTD PT100 Pro', 'compatible', 'Sensor recomendado para este transmisor'],
    ['Caudalimetro Electromagnetico EM-200', 'Gateway Industrial GW-500', 'compatible', 'Integración Modbus para SCADA'],
    ['Módem LTE Industrial LT-100', 'Switch Industrial SW-8', 'compatible', 'Topología típica de red remota'],
    ['Detector Gas DG-77', 'Caja ATEX CA-2', 'compatible', 'Montaje en zona clasificada'],
    ['Barreras Intrinsecas BI-4', 'Detector Gas DG-77', 'compatible', 'Seguridad intrínseca en lazo de señal'],
    ['Sensor Flujo Turbina TF-22', 'Caudalimetro Electromagnetico EM-200', 'incompatible', 'Tecnologías de medición para aplicaciones distintas'],
    ['Termopar Tipo K TK-900', 'RTD PT100 Pro', 'incompatible', 'Tipos de sensor distintos para la misma entrada'],
  ] as const;

  for (const [origenNombre, destinoNombre, tipo, nota] of compatibilidadesSeed) {
    const productoOrigenId = idPorNombre.get(origenNombre);
    const productoDestinoId = idPorNombre.get(destinoNombre);
    if (!productoOrigenId || !productoDestinoId) continue;

    await prisma.compatibilidadProducto.create({
      data: {
        productoOrigenId,
        productoDestinoId,
        tipo,
        nota,
      },
    });
  }

  const proyectosSeed = [
    ['Migracion SCADA Planta Norte', 'Actualizacion de red de instrumentacion y tableros de control', 'Industrias Nova', 'maria.lopez@industrias-nova.com'],
    ['Monitoreo Flujo Terminal Sur', 'Integracion de medidores y dashboard de alarmas', 'Logisur Terminales', 'carlos.ramirez@petroval.mx'],
    ['Control de Nivel Tanques T-40', 'Automatizacion de llenado y seguridad de sobrellenado', 'Petroval Operaciones', 'ana.soto@aquaflow.com'],
    ['Modernizacion Cuarto de Bombas', 'Instrumentacion y comunicaciones industriales redundantes', 'AquaFlow Soluciones', 'javier.ponce@cementa.com'],
    ['Proyecto Eficiencia Energetica', 'Control inteligente de valvulas y setpoints de proceso', 'Enertek Proyectos', 'lucia.mendez@enertek.com'],
  ] as const;

  for (let i = 0; i < proyectosSeed.length; i += 1) {
    const [nombre, descripcion, cliente, email] = proyectosSeed[i];
    const usuarioId = usuarioPorEmail.get(email) ?? usuarios[0]?.id;
    if (!usuarioId) continue;

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - (i + 1) * 18);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 120 + i * 10);

    const existente = await prisma.proyecto.findFirst({ where: { nombre, usuarioId } });
    const proyecto = existente
      ? await prisma.proyecto.update({
          where: { id: existente.id },
          data: {
            descripcion,
            cliente,
            estado: i % 3 === 0 ? EstadoProyecto.en_progreso : EstadoProyecto.planificacion,
            porcentajeAvance: i % 3 === 0 ? 35 + i * 7 : 10 + i * 3,
            fechaInicio,
            fechaFinEstimada: fechaFin,
            gerente: 'Ing. Operaciones CYACO',
            presupuesto: 250000 + i * 55000,
            activo: true,
          },
        })
      : await prisma.proyecto.create({
          data: {
            nombre,
            descripcion,
            cliente,
            estado: i % 3 === 0 ? EstadoProyecto.en_progreso : EstadoProyecto.planificacion,
            porcentajeAvance: i % 3 === 0 ? 35 + i * 7 : 10 + i * 3,
            fechaInicio,
            fechaFinEstimada: fechaFin,
            gerente: 'Ing. Operaciones CYACO',
            presupuesto: 250000 + i * 55000,
            activo: true,
            usuarioId,
          },
        });

    await prisma.tareaProyecto.deleteMany({ where: { proyectoId: proyecto.id } });
    await prisma.bitacoraProyecto.deleteMany({ where: { proyectoId: proyecto.id } });

    const tareas = [
      ['Levantamiento tecnico', EstadoTareaProyecto.completada, 100, 1],
      ['Ingenieria de detalle', EstadoTareaProyecto.en_progreso, 60, 2],
      ['Instalacion en campo', EstadoTareaProyecto.pendiente, 0, 3],
      ['Puesta en marcha', EstadoTareaProyecto.pendiente, 0, 4],
    ] as const;

    for (const [titulo, estado, progreso, orden] of tareas) {
      await prisma.tareaProyecto.create({
        data: {
          proyectoId: proyecto.id,
          titulo,
          descripcion: `${titulo} para ${nombre}`,
          estado,
          progreso,
          orden,
          fechaEstimada: new Date(fechaInicio.getTime() + orden * 15 * 24 * 60 * 60 * 1000),
        },
      });
    }

    for (let j = 0; j < 3; j += 1) {
      await prisma.bitacoraProyecto.create({
        data: {
          proyectoId: proyecto.id,
          nota: `Bitacora ${j + 1}: avance del proyecto ${nombre}.`,
          avance: Math.min(95, 20 + j * 15 + i * 4),
        },
      });
    }
  }

  const productos = await prisma.producto.findMany({ where: { activo: true }, take: 12, orderBy: { id: 'asc' } });
  const clientesUsuario = await prisma.usuario.findMany({ where: { rol: RolUsuario.cliente, activo: true }, orderBy: { id: 'asc' }, take: 4 });

  for (let i = 0; i < clientesUsuario.length; i += 1) {
    const usuario = clientesUsuario[i];
    const numero = `COT-SEED-${String(i + 1).padStart(3, '0')}`;
    const seleccion = productos.slice(i * 2, i * 2 + 3);
    const subtotal = seleccion.reduce((acc, p, idx) => acc + p.precio * (idx + 1), 0);
    const descuentoPct = i % 2 === 0 ? 5 : 0;
    const margenPct = 12;
    const totalDescuento = subtotal - subtotal * (descuentoPct / 100);
    const total = totalDescuento + totalDescuento * (margenPct / 100);

    const existente = await prisma.cotizacion.findUnique({ where: { numero } });
    if (existente) {
      await prisma.itemCotizacion.deleteMany({ where: { cotizacionId: existente.id } });
      await prisma.cotizacion.update({
        where: { id: existente.id },
        data: {
          usuarioId: usuario.id,
          estado: i % 2 === 0 ? EstadoCotizacion.enviada : EstadoCotizacion.aceptada,
          subtotal,
          descuentoPct,
          margenPct,
          total,
          observaciones: 'Cotizacion semilla para demostracion comercial',
          contactoNombre: usuario.nombre,
          contactoCorreo: usuario.email,
          contactoTelefono: usuario.telefono,
          contactoCargo: usuario.cargo,
          contactoEmpresa: usuario.empresa,
          proyectoNombre: `Proyecto Demo ${i + 1}`,
          fechaRequerida: new Date(Date.now() + (20 + i * 8) * 24 * 60 * 60 * 1000),
          enviadoEn: new Date(),
        },
      });
      for (let j = 0; j < seleccion.length; j += 1) {
        const p = seleccion[j];
        const cantidad = j + 1;
        await prisma.itemCotizacion.create({
          data: {
            cotizacionId: existente.id,
            productoId: p.id,
            cantidad,
            precioUnitario: p.precio,
            subtotal: p.precio * cantidad,
          },
        });
      }
    } else {
      await prisma.cotizacion.create({
        data: {
          numero,
          version: 1,
          usuarioId: usuario.id,
          estado: i % 2 === 0 ? EstadoCotizacion.enviada : EstadoCotizacion.aceptada,
          subtotal,
          descuentoPct,
          margenPct,
          total,
          observaciones: 'Cotizacion semilla para demostracion comercial',
          contactoNombre: usuario.nombre,
          contactoCorreo: usuario.email,
          contactoTelefono: usuario.telefono,
          contactoCargo: usuario.cargo,
          contactoEmpresa: usuario.empresa,
          proyectoNombre: `Proyecto Demo ${i + 1}`,
          fechaRequerida: new Date(Date.now() + (20 + i * 8) * 24 * 60 * 60 * 1000),
          enviadoEn: new Date(),
          items: {
            create: seleccion.map((p, idx) => ({
              productoId: p.id,
              cantidad: idx + 1,
              precioUnitario: p.precio,
              subtotal: p.precio * (idx + 1),
            })),
          },
        },
      });
    }
  }

  const [totalUsuarios, totalClientes, totalCategorias, totalProductos, totalProyectos, totalCotizaciones] = await Promise.all([
    prisma.usuario.count(),
    prisma.cliente.count(),
    prisma.categoria.count(),
    prisma.producto.count(),
    prisma.proyecto.count(),
    prisma.cotizacion.count(),
  ]);

  console.log('Seed completado:');
  console.log({ totalUsuarios, totalClientes, totalCategorias, totalProductos, totalProyectos, totalCotizaciones });
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
