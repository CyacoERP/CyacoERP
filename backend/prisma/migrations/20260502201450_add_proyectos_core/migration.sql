-- CreateEnum
CREATE TYPE "public"."EstadoCotizacion" AS ENUM ('borrador', 'enviada', 'aceptada', 'rechazada', 'cancelada');

-- CreateEnum
CREATE TYPE "public"."EstadoProyecto" AS ENUM ('planificacion', 'en_progreso', 'pausado', 'finalizado');

-- CreateEnum
CREATE TYPE "public"."EstadoTareaProyecto" AS ENUM ('pendiente', 'en_progreso', 'bloqueada', 'completada');

-- CreateTable
CREATE TABLE "public"."cotizaciones" (
    "id" SERIAL NOT NULL,
    "numero" VARCHAR(40) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "usuarioId" INTEGER NOT NULL,
    "estado" "public"."EstadoCotizacion" NOT NULL DEFAULT 'borrador',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "descuentoPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "margenPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "observaciones" VARCHAR(500),
    "contactoNombre" VARCHAR(160),
    "contactoCorreo" VARCHAR(160),
    "contactoTelefono" VARCHAR(30),
    "contactoCargo" VARCHAR(120),
    "contactoEmpresa" VARCHAR(180),
    "proyectoNombre" VARCHAR(180),
    "fechaRequerida" TIMESTAMP(3),
    "enviadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cotizacion_items" (
    "id" SERIAL NOT NULL,
    "cotizacionId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizacion_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proyectos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(180) NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "cliente" VARCHAR(180) NOT NULL,
    "estado" "public"."EstadoProyecto" NOT NULL DEFAULT 'planificacion',
    "porcentajeAvance" INTEGER NOT NULL DEFAULT 0,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFinEstimada" TIMESTAMP(3) NOT NULL,
    "gerente" VARCHAR(160),
    "presupuesto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "usuarioId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proyecto_tareas" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "titulo" VARCHAR(180) NOT NULL,
    "descripcion" VARCHAR(500),
    "estado" "public"."EstadoTareaProyecto" NOT NULL DEFAULT 'pendiente',
    "progreso" INTEGER NOT NULL DEFAULT 0,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "fechaEstimada" TIMESTAMP(3),
    "fechaReal" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proyecto_tareas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proyecto_bitacora" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "nota" VARCHAR(500) NOT NULL,
    "avance" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyecto_bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_numero_key" ON "public"."cotizaciones"("numero");

-- AddForeignKey
ALTER TABLE "public"."cotizaciones" ADD CONSTRAINT "cotizaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cotizacion_items" ADD CONSTRAINT "cotizacion_items_cotizacionId_fkey" FOREIGN KEY ("cotizacionId") REFERENCES "public"."cotizaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cotizacion_items" ADD CONSTRAINT "cotizacion_items_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "public"."productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proyectos" ADD CONSTRAINT "proyectos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proyecto_tareas" ADD CONSTRAINT "proyecto_tareas_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proyecto_bitacora" ADD CONSTRAINT "proyecto_bitacora_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "public"."proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
