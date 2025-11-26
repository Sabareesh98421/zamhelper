
'use client';

import { createContext, useState, useCallback, ReactNode } from 'react';

type SnackbarMessage = {
  message: string;
  type: 'success' | 'error';
};

type SnackbarContextType = {
  addMessage: (message: string, type: 'success' | 'error') => void;
};

export const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);

  const addMessage = useCallback((message: string, type: 'success' | 'error') => {
    const newMessage = { message, type };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setTimeout(() => {
      setMessages((prevMessages) => prevMessages.slice(1));
    }, 3000); // Message disappears after 3 seconds
  }, []);

  return (
    <SnackbarContext.Provider value={{ addMessage }}>
      {children}
      <div className="fixed top-5 right-5 z-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`px-6 py-4 rounded-md shadow-lg text-white mb-2 ${
              msg.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};
