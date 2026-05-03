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
};

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@cyaco.local').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin12345';
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
    ['maria.lopez@industrias-nova.com', 'Maria Lopez', 'Industrias Nova', 'Gerente de Planta'],
    ['carlos.ramirez@petroval.mx', 'Carlos Ramirez', 'Petroval', 'Jefe de Instrumentacion'],
    ['ana.soto@aquaflow.com', 'Ana Soto', 'AquaFlow', 'Compras Tecnicas'],
    ['javier.ponce@cementa.com', 'Javier Ponce', 'Cementa', 'Mantenimiento'],
    ['lucia.mendez@enertek.com', 'Lucia Mendez', 'Enertek', 'Ingenieria de Proyectos'],
  ] as const;

  for (const [email, nombre, empresa, cargo] of usuariosCliente) {
    const hash = await bcrypt.hash('Cliente123!', 10);
    await prisma.usuario.upsert({
      where: { email },
      update: { nombre, empresa, cargo, passwordHash: hash, rol: RolUsuario.cliente, activo: true },
      create: { nombre, email, empresa, cargo, passwordHash: hash, rol: RolUsuario.cliente, activo: true },
    });
  }

  const clientes = [
    ['Industrias Nova SA de CV', 'INO010101A11', 'contacto@industrias-nova.com', '3310010001', 'Manufactura'],
    ['Petroval Operaciones', 'PET020202B22', 'compras@petroval.mx', '3310010002', 'Oil & Gas'],
    ['AquaFlow Soluciones', 'AQU030303C33', 'ventas@aquaflow.com', '3310010003', 'Tratamiento de agua'],
    ['Cementa del Norte', 'CEM040404D44', 'ingenieria@cementa.com', '3310010004', 'Cemento'],
    ['Enertek Proyectos', 'ENE050505E55', 'proyectos@enertek.com', '3310010005', 'Energia'],
    ['Quimica Atlas', 'QUI060606F66', 'operaciones@quimicaatlas.com', '3310010006', 'Quimica'],
    ['MetalMec Industrial', 'MET070707G77', 'contacto@metalmec.com', '3310010007', 'Metal mecánica'],
    ['Logisur Terminales', 'LOG080808H88', 'supply@logisur.com', '3310010008', 'Logistica'],
    ['BioFood Process', 'BIO090909I99', 'mantenimiento@biofood.com', '3310010009', 'Alimentos'],
    ['Papeles Delta', 'PAP101010J10', 'planta@papelesdelta.com', '3310010010', 'Papel'],
  ] as const;

  for (const [razonSocial, rfc, email, telefono, sector] of clientes) {
    await prisma.cliente.upsert({
      where: { rfc },
      update: { razonSocial, email, telefono, sector, activo: true },
      create: { razonSocial, rfc, email, telefono, sector, activo: true },
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

  const productosSeed: ProductoSeed[] = [
    { nombre: 'Transmisor Presion X100', descripcion: 'Rango 0-100 bar, salida 4-20mA, acero inoxidable', precio: 12500, stock: 18, categoria: 'Presion' },
    { nombre: 'Transmisor Presion X300', descripcion: 'Alta precision para procesos criticos, HART', precio: 18900, stock: 12, categoria: 'Presion' },
    { nombre: 'Manometro Digital DPM-45', descripcion: 'Display retroiluminado, IP65', precio: 4200, stock: 25, categoria: 'Presion' },
    { nombre: 'Caudalimetro Electromagnetico EM-200', descripcion: 'Medicion de flujo en agua y lodos', precio: 26500, stock: 9, categoria: 'Flujo' },
    { nombre: 'Caudalimetro Ultrasónico UF-90', descripcion: 'Clamp-on, instalacion sin corte de linea', precio: 31800, stock: 7, categoria: 'Flujo' },
    { nombre: 'Sensor Flujo Turbina TF-22', descripcion: 'Bajo costo para fluidos limpios', precio: 7300, stock: 20, categoria: 'Flujo' },
    { nombre: 'RTD PT100 Pro', descripcion: 'Sonda industrial clase A', precio: 2500, stock: 32, categoria: 'Temperatura' },
    { nombre: 'Termopar Tipo K TK-900', descripcion: 'Alta temperatura hasta 1200C', precio: 2900, stock: 28, categoria: 'Temperatura' },
    { nombre: 'Transmisor Temperatura TT-8', descripcion: 'Entrada universal, salida HART', precio: 8600, stock: 15, categoria: 'Temperatura' },
    { nombre: 'Radar Nivel RN-40', descripcion: 'Medicion continua para tanques', precio: 34500, stock: 6, categoria: 'Nivel' },
    { nombre: 'Ultrasonico Nivel UL-25', descripcion: 'Control de nivel no contacto', precio: 14500, stock: 11, categoria: 'Nivel' },
    { nombre: 'Interruptor Nivel LN-2', descripcion: 'Punto alto/bajo para tanques', precio: 3900, stock: 30, categoria: 'Nivel' },
    { nombre: 'Valvula Control VC-4', descripcion: 'Valvula globo actuada 2 pulgadas', precio: 22500, stock: 8, categoria: 'Valvulas' },
    { nombre: 'Actuador Neumatico AN-90', descripcion: 'Accionamiento para valvulas de proceso', precio: 11900, stock: 16, categoria: 'Valvulas' },
    { nombre: 'Posicionador Inteligente PI-12', descripcion: 'Precision de posicion con diagnostico', precio: 9800, stock: 13, categoria: 'Valvulas' },
    { nombre: 'Gateway Industrial GW-500', descripcion: 'Conversor Modbus TCP/RTU', precio: 8700, stock: 17, categoria: 'Comunicacion' },
    { nombre: 'Switch Industrial SW-8', descripcion: '8 puertos ethernet, riel DIN', precio: 6100, stock: 21, categoria: 'Comunicacion' },
    { nombre: 'Módem LTE Industrial LT-100', descripcion: 'Conectividad remota segura para SCADA', precio: 10500, stock: 10, categoria: 'Comunicacion' },
    { nombre: 'Detector Gas DG-77', descripcion: 'Deteccion de gases combustibles', precio: 21300, stock: 9, categoria: 'Seguridad' },
    { nombre: 'Barreras Intrinsecas BI-4', descripcion: 'Proteccion para lazo en zona peligrosa', precio: 7900, stock: 18, categoria: 'Seguridad' },
    { nombre: 'Caja ATEX CA-2', descripcion: 'Encapsulado para instrumentacion en campo', precio: 5200, stock: 22, categoria: 'Seguridad' },
    { nombre: 'Analizador pH APH-300', descripcion: 'Monitoreo continuo de pH en linea', precio: 19800, stock: 8, categoria: 'Analitica' },
    { nombre: 'Analizador Conductividad AC-11', descripcion: 'Control de calidad de agua de proceso', precio: 16400, stock: 12, categoria: 'Analitica' },
    { nombre: 'Oxigeno Disuelto OD-7', descripcion: 'Sensor optico para tratamiento de agua', precio: 23800, stock: 5, categoria: 'Analitica' },
  ];

  for (let i = 0; i < productosSeed.length; i += 1) {
    const p = productosSeed[i];
    const categoriaId = categoriaPorNombre.get(p.categoria);
    if (!categoriaId) continue;

    const existente = await prisma.producto.findFirst({
      where: { nombre: p.nombre, categoriaId },
    });

    const imagenUrl = imagePool[i % imagePool.length];
    const urlDocumento = `/uploads/documentos/ficha-${(i + 1).toString().padStart(2, '0')}.pdf`;

    if (existente) {
      await prisma.producto.update({
        where: { id: existente.id },
        data: {
          descripcion: p.descripcion,
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
