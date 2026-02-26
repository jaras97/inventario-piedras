import { create } from 'zustand';

type MessageType = 'success' | 'error';

interface MessageState {
  message: string | null;
  type: MessageType | null;
  show: boolean;
  setMessage: (type: MessageType, message: string) => void;
  clearMessage: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  message: null,
  type: null,
  show: false,
  setMessage: (type, message) =>
    set({ type, message, show: true }),
  clearMessage: () => set({ message: null, type: null, show: false }),
}));