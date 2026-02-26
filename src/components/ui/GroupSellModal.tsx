'use client';

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import {
  ManualProduct,
  ProductOption,
} from '@/components/ui/ManualProductTable';
import ManualProductTable from '@/components/ui/ManualProductTable';
import { Button } from '@/components/ui/button';
import { useMessageStore } from '@/store/messageStore';

type PaymentMethod =
  | 'EFECTIVO'
  | 'TRANSFERENCIA'
  | 'NEQUI'
  | 'DAVIPLATA'
  | 'TARJETA'
  | 'OTRO';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function GroupSellModal({ open, onClose, onSuccess }: Props) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [manualProducts, setManualProducts] = useState<ManualProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFECTIVO');
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');

  const { setMessage } = useMessageStore();

  useEffect(() => {
    if (!open) return;
    fetch('/api/inventario/nombres')
      .then((res) => res.json())
      .then((data: ProductOption[]) => setProducts(data || []))
      .catch((err) => console.error('Error cargando productos', err));
  }, [open]);

  const total = manualProducts.reduce(
    (sum, p) => sum + p.quantity * (p.price ?? 0),
    0,
  );

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const valid = manualProducts.filter(
        (item) =>
          item.name &&
          item.quantity > 0 &&
          item.price !== undefined &&
          item.price >= 0,
      );

      if (valid.length === 0) {
        setMessage('error', 'Debes agregar al menos un producto válido');
        return;
      }

      const payload = valid.map((item) => {
        const match = products.find((p) => p.name === item.name);
        return {
          itemId: match?.id,
          amount: item.quantity,
          price: item.price,
        };
      });

      const res = await fetch('/api/inventario/venta-grupal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payload,
          paymentMethod,
          clientName: clientName || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) throw new Error('Error al procesar venta');
      setMessage('success', 'Venta grupal registrada exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      setMessage('error', 'Error al procesar venta grupal');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={onClose}>
        <div className='fixed inset-0 bg-black/30 backdrop-blur-sm' />

        <div className='fixed inset-0 flex items-center justify-center p-2 sm:p-4'>
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-200'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <DialogPanel className='w-full max-w-3xl rounded bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto'>
              <DialogTitle className='text-lg font-bold mb-4'>
                Venta Grupal de Productos
              </DialogTitle>

              <ManualProductTable
                value={manualProducts}
                onChange={setManualProducts}
                products={products}
                mode='sell'
              />

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Método de pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className='mt-1 w-full border rounded px-3 py-2 text-sm'
                  >
                    <option value='EFECTIVO'>Efectivo</option>
                    <option value='TRANSFERENCIA'>Transferencia</option>
                    <option value='NEQUI'>Nequi</option>
                    <option value='DAVIPLATA'>Daviplata</option>
                    <option value='TARJETA'>Tarjeta</option>
                    <option value='OTRO'>Otro</option>
                  </select>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Cliente (opcional)
                  </label>
                  <input
                    type='text'
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className='mt-1 w-full border rounded px-3 py-2 text-sm'
                    placeholder='Nombre del cliente'
                  />
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Notas (opcional)
                  </label>
                  <input
                    type='text'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className='mt-1 w-full border rounded px-3 py-2 text-sm'
                    placeholder='Comentarios o detalles'
                  />
                </div>
              </div>

              <div className='flex justify-between items-center mt-6 flex-col sm:flex-row gap-2 sm:gap-0'>
                <p className='text-sm font-medium text-gray-700'>
                  Total:{' '}
                  <span className='font-bold text-blue-700'>
                    ${total.toLocaleString()} COP
                  </span>
                  <span className='block sm:inline text-xs text-gray-500 ml-1'>
                    (calculado por cantidad × precio unitario ingresado)
                  </span>
                </p>

                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Procesando...' : 'Confirmar Venta'}
                  </Button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
