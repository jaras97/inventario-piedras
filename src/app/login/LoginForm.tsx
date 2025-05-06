'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSession, signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.ok) {
      const session = await getSession();
      if (session?.user?.isAuthorized) {
        router.push('/dashboard');
      } else {
        setError('Tu cuenta aún no ha sido autorizada.');
        await signOut({ redirect: false });
      }
    } else {
      setError('Credenciales inválidas');
    }
  };

  // 🌀 Muestra loader suave mientras detecta el estado de sesión
  if (status === 'loading') {
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-white z-50'>
        <motion.div
          className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='bg-white p-8 rounded shadow-md w-full max-w-sm'
    >
      <h1 className='text-xl font-semibold mb-4'>Iniciar sesión</h1>

      <div className='mb-4'>
        <label className='block mb-1 font-medium'>Email</label>
        <input
          type='email'
          {...register('email')}
          className='w-full border rounded px-3 py-2'
        />
        {errors.email && (
          <p className='text-red-500 text-sm'>{errors.email.message}</p>
        )}
      </div>

      <div className='mb-4'>
        <label className='block mb-1 font-medium'>Contraseña</label>
        <input
          type='password'
          {...register('password')}
          className='w-full border rounded px-3 py-2'
        />
        {errors.password && (
          <p className='text-red-500 text-sm'>{errors.password.message}</p>
        )}
      </div>

      {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

      <button
        type='submit'
        disabled={isSubmitting}
        className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition'
      >
        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
      </button>

      <div className='mt-6 text-center'>
        <p className='text-sm text-gray-600 mb-2'>o</p>
        <button
          type='button'
          onClick={() => signIn('google')}
          className='w-full border text-gray-800 py-2 rounded hover:bg-gray-100 transition'
        >
          Ingresar con Google
        </button>
      </div>
    </form>
  );
}
