-- CreateEnum
CREATE TYPE "ValueType" AS ENUM ('INTEGER', 'DECIMAL');

-- AlterTable
ALTER TABLE "InventoryUnit" ADD COLUMN     "valueType" "ValueType" NOT NULL DEFAULT 'DECIMAL';
