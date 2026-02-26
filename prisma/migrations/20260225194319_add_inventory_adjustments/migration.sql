/*
  Warnings:

  - You are about to alter the column `quantity` on the `InventoryItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,3)`.
  - You are about to alter the column `price` on the `InventoryItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,3)`.
  - You are about to alter the column `amount` on the `InventoryTransaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,3)`.
  - You are about to alter the column `price` on the `InventoryTransaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(18,2)`.

*/
-- AlterTable
ALTER TABLE "InventoryItem" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(18,3),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(18,3);

-- AlterTable
ALTER TABLE "InventoryTransaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,3),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(18,2);
