/*
  Warnings:

  - The `paymentMethod` column on the `InventoryTransactionGroup` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "InventoryTransactionGroup" DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "PaymentMethod";
