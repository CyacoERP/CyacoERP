/*
  Warnings:

  - You are about to drop the column `email` on the `clientes` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `clientes` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "clientes_email_key";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "email",
DROP COLUMN "telefono",
ADD COLUMN     "codigo_postal" VARCHAR(10);
