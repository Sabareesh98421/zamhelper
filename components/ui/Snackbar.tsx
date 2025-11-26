
'use client';

import { error } from 'console';
import { createContext, useState, useCallback, ReactNode } from 'react';

type SnackbarMessage = {
  message: string;
  type: 'success' | 'error'|'info'|'warning';
};

type SnackbarContextType = {
  addMessage: (message: string, type:SnackbarMessage["type"]) => void;
};

export const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<SnackbarMessage[]>([]);
  const snackbarType={
    success:"bg-green-500",
    error:"bg-red-500",
    warning:"bg-yellow-500",
    info:"bg-blue-500"
  }
  const addMessage = useCallback((message: string, type: SnackbarMessage["type"]) => {
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
              snackbarType[msg.type ]
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};
