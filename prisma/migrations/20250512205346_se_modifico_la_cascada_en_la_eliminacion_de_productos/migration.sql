-- DropForeignKey
ALTER TABLE "ItemsOrder" DROP CONSTRAINT "ItemsOrder_productoId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "ItemsOrder" ALTER COLUMN "productoId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemsOrder" ADD CONSTRAINT "ItemsOrder_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Products"("productoId") ON DELETE SET NULL ON UPDATE CASCADE;
