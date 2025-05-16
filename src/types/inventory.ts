// src/types/inventory.ts

export type InventoryItem = {
  id: string;
  name: string;
  categoryId: string;
  category?: { id: string; name: string };
  unit: {
    id?: string;
    name: string;
    valueType: 'INTEGER' | 'DECIMAL';
  };
  quantity?: number;
  price?: number;
  subcategoryCode?: { id: string; code: string } | null;
};
