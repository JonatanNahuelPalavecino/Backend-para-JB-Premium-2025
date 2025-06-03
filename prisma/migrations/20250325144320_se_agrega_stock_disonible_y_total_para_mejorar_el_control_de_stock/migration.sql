/*
  Warnings:

  - You are about to drop the column `stock` on the `Products` table. All the data in the column will be lost.
  - Added the required column `stock_disponible` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock_total` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" DROP COLUMN "stock",
ADD COLUMN     "stock_disponible" INTEGER NOT NULL,
ADD COLUMN     "stock_total" INTEGER NOT NULL;
