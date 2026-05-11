/*
  Warnings:

  - A unique constraint covering the columns `[sku_interno]` on the table `productos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MonedaProducto" AS ENUM ('MXN', 'USD');

-- CreateEnum
CREATE TYPE "TipoCompatibilidad" AS ENUM ('compatible', 'incompatible');

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "especificaciones_tecnicas" JSONB,
ADD COLUMN     "fabricante" VARCHAR(120),
ADD COLUMN     "familia" VARCHAR(120),
ADD COLUMN     "moneda" "MonedaProducto" NOT NULL DEFAULT 'MXN',
ADD COLUMN     "numero_parte" VARCHAR(100),
ADD COLUMN     "sku_interno" VARCHAR(100),
ALTER COLUMN "descripcion" SET DATA TYPE VARCHAR(500);

-- CreateTable
CREATE TABLE "producto_compatibilidades" (
    "id" SERIAL NOT NULL,
    "producto_origen_id" INTEGER NOT NULL,
    "producto_destino_id" INTEGER NOT NULL,
    "tipo" "TipoCompatibilidad" NOT NULL,
    "nota" VARCHAR(255),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producto_compatibilidades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "producto_compatibilidades_producto_origen_id_producto_desti_key" ON "producto_compatibilidades"("producto_origen_id", "producto_destino_id", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_interno_key" ON "productos"("sku_interno");

-- AddForeignKey
ALTER TABLE "producto_compatibilidades" ADD CONSTRAINT "producto_compatibilidades_producto_origen_id_fkey" FOREIGN KEY ("producto_origen_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_compatibilidades" ADD CONSTRAINT "producto_compatibilidades_producto_destino_id_fkey" FOREIGN KEY ("producto_destino_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
