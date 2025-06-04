'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSession, signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
      className='bg-blue-900 p-8 rounded-lg shadow-xl w-full max-w-md mx-auto border border-blue-700'
    >
      <div className='flex justify-center mb-6'>
        <Image
          src='/logo.svg'
          alt='Metales y Brillantes'
          width={140}
          height={80}
          className='object-contain'
          priority
        />
      </div>

      <h1 className='text-2xl font-bold text-center text-white mb-6'>
        Iniciar sesión
      </h1>

      <div className='mb-4'>
        <label className='block mb-1 font-medium text-white'>Email</label>
        <input
          type='email'
          {...register('email')}
          className='w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white bg-transparent placeholder:text-blue-100'
          placeholder='correo@ejemplo.com'
        />
        {errors.email && (
          <p className='text-red-300 text-sm mt-1'>{errors.email.message}</p>
        )}
      </div>

      <div className='mb-4'>
        <label className='block mb-1 font-medium text-white'>Contraseña</label>
        <input
          type='password'
          {...register('password')}
          className='w-full border border-blue-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white bg-transparent placeholder:text-blue-100'
          placeholder='********'
        />
        {errors.password && (
          <p className='text-red-300 text-sm mt-1'>{errors.password.message}</p>
        )}
      </div>

      {error && (
        <p className='text-red-300 text-sm mb-4 text-center'>{error}</p>
      )}

      <button
        type='submit'
        disabled={isSubmitting}
        className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold'
      >
        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
