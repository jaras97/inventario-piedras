-- DropIndex
DROP INDEX "InventorySubcategoryCode_code_key";

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "subcategoryCodeId" TEXT;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_subcategoryCodeId_fkey" FOREIGN KEY ("subcategoryCodeId") REFERENCES "InventorySubcategoryCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
