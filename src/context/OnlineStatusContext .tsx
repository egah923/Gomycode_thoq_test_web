import React, { createContext, useContext } from 'react';
import useOnlineStatus from '@/utils/hooks/useNetworkStatus'; // Assuming this is where useOnlineStatus is defined

// Define a context type
interface OnlineStatusContextType {
  isOnline: boolean;
}

// Create the context with initial undefined value
const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

// Define props for the provider component
interface OnlineStatusProviderProps {
  children: React.ReactNode; // Define children prop explicitly
}

// Define the provider component
export const OnlineStatusProvider: React.FC<OnlineStatusProviderProps> = ({ children }) => {
  const isOnline = useOnlineStatus();

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

// Custom hook to use the online status context
export const useOnlineStatusContext = () => {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error('useOnlineStatusContext must be used within an OnlineStatusProvider');
  }
  return context;
};
