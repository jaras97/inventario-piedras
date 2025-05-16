/*
  Warnings:

  - You are about to drop the column `typeId` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the `InventoryType` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,categoryId,unitId]` on the table `InventoryItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `InventoryItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InventoryItem" DROP CONSTRAINT "InventoryItem_typeId_fkey";

-- DropIndex
DROP INDEX "InventoryItem_name_typeId_unitId_key";

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "typeId",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- DropTable
DROP TABLE "InventoryType";

-- CreateTable
CREATE TABLE "InventoryCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "InventoryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventorySubcategoryCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "InventorySubcategoryCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryCategory_name_key" ON "InventoryCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InventorySubcategoryCode_code_key" ON "InventorySubcategoryCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InventorySubcategoryCode_code_categoryId_key" ON "InventorySubcategoryCode"("code", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_name_categoryId_unitId_key" ON "InventoryItem"("name", "categoryId", "unitId");

-- AddForeignKey
ALTER TABLE "InventorySubcategoryCode" ADD CONSTRAINT "InventorySubcategoryCode_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InventoryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "InventoryCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
