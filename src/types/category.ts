export interface CategoryWithCodes {
  id: string;
  name: string;
  codes: {
    id: string;
    code: string;
  }[];
}