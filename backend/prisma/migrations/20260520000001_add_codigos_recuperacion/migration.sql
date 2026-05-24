-- CreateTable
CREATE TABLE "codigos_recuperacion" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "codigo" VARCHAR(8) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigos_recuperacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "codigos_recuperacion_email_idx" ON "codigos_recuperacion"("email");
