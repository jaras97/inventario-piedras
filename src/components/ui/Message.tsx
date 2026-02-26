'use client';

import { useEffect } from 'react';
import { useMessageStore } from '@/store/messageStore';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Message() {
  const { message, type, show, clearMessage } = useMessageStore();

  useEffect(() => {
    if (show) {
      const timeout = setTimeout(() => {
        clearMessage();
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [show]);

  if (!show || !message) return null;

  const isSuccess = type === 'success';

  return (
    <div
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-[1000] max-w-[90%] sm:max-w-md px-5 py-4 rounded-lg shadow-xl border transition-all duration-300 animate-fade-in-up',
        isSuccess
          ? 'bg-green-50 border-green-400 text-green-800'
          : 'bg-red-50 border-red-400 text-red-800',
      )}
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='flex items-center gap-2 text-base font-medium'>
          {isSuccess ? (
            <CheckCircle className='w-5 h-5 text-green-600' />
          ) : (
            <AlertCircle className='w-5 h-5 text-red-600' />
          )}
          <span>{message}</span>
        </div>
        <button
          onClick={clearMessage}
          className='mt-1 text-gray-500 hover:text-black'
        >
          <X className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}
