'use client';

import { SessionProvider } from 'next-auth/react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <main className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      <SessionProvider>
        {' '}
        <LoginForm />
      </SessionProvider>
    </main>
  );
}
