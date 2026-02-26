/*
  Warnings:

  - You are about to drop the column `type` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `InventoryItem` table. All the data in the column will be lost.
  - Added the required column `typeId` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "type",
DROP COLUMN "unit",
ADD COLUMN     "typeId" TEXT NOT NULL,
ADD COLUMN     "unitId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "InventoryType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "InventoryType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "InventoryUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryType_name_key" ON "InventoryType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryUnit_name_key" ON "InventoryUnit"("name");

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "InventoryType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "InventoryUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
