-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "activo" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;
