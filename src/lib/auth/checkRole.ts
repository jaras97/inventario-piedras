// lib/auth/checkRole.ts

import { getSession } from "next-auth/react";


export async function checkRole(requiredRoles: string[]) {
  const session = await getSession();
  const user = session?.user;

if (!user?.role || !requiredRoles.includes(user.role)) {
  return false;
}

  return true;
}