// src/types.ts
export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'AUDITOR';
  isAuthorized: boolean;
  createdAt: string;
};