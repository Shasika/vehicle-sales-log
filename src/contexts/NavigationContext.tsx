'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationContextType {
  isNavigating: boolean;
  currentPath: string;
  navigate: (href: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setCurrentPath(pathname);
    setIsNavigating(false);
  }, [pathname]);

  const navigate = (href: string) => {
    if (href === pathname) return; // Don't navigate to current page

    setIsNavigating(true);
    setCurrentPath(href);

    // Start navigation immediately
    router.push(href);

    // Set a timeout to clear loading state if navigation takes too long
    setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
  };

  return (
    <NavigationContext.Provider value={{ isNavigating, currentPath, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};