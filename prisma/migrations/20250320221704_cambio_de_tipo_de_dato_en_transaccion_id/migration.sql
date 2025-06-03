/*
  Warnings:

  - Changed the type of `transaccionId` on the `Transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "transaccionId",
ADD COLUMN     "transaccionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_transaccionId_key" ON "Transactions"("transaccionId");
