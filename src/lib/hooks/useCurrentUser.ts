'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type CurrentUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  isAuthorized: boolean;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('No autorizado');
        const json = await res.json();
        setUser(json.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading };
}


export function useRoleProtection(allowedRoles: string[], redirect = '/dashboard') {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role || '')) {
      router.replace(redirect);
    }
  }, [user, isLoading, router, allowedRoles]);

  return { user, isLoading };
}