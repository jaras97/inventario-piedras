export const ROLES = {
    ADMIN: 'ADMIN',
    AUDITOR: 'AUDITOR',
    USER: 'USER',
  } as const;
  
  export type Role = keyof typeof ROLES;
  
  /**
   * Verifica si el rol tiene permisos de escritura
   */
  export function hasWriteAccess(role?: string): boolean {
    return role === ROLES.ADMIN;
  }
  
  /**
   * Verifica si el rol tiene permisos de solo lectura
   */
  export function hasReadOnlyAccess(role?: string): boolean {
    return role === ROLES.AUDITOR || role === ROLES.USER;
  }