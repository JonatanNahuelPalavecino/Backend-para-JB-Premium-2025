-- CreateTable
CREATE TABLE "Order" (
    "orderId" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "direccion" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "ItemsOrder" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "productoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemsOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "productoId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "accesorio" BOOLEAN NOT NULL,
    "porcDesc" INTEGER NOT NULL,
    "destacado" BOOLEAN NOT NULL,
    "foto" TEXT NOT NULL,
    "bodega" TEXT NOT NULL,
    "cosecha" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "crianza" TEXT NOT NULL,
    "descUno" TEXT NOT NULL,
    "descDos" TEXT NOT NULL,
    "faseGus" TEXT NOT NULL,
    "faseOlf" TEXT NOT NULL,
    "faseVis" TEXT NOT NULL,
    "grado" TEXT NOT NULL,
    "maridaje" TEXT NOT NULL,
    "temp" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "vino" TEXT NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("productoId")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" SERIAL NOT NULL,
    "transaccionId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tarjeta" TEXT NOT NULL,
    "tipoDeTarjeta" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "detalleDelPago" TEXT NOT NULL,
    "pagoRecibido" DOUBLE PRECISION NOT NULL,
    "pagoBruto" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "userId" SERIAL NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'user',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_transaccionId_key" ON "Transactions"("transaccionId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemsOrder" ADD CONSTRAINT "ItemsOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemsOrder" ADD CONSTRAINT "ItemsOrder_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Products"("productoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE ON UPDATE CASCADE;
