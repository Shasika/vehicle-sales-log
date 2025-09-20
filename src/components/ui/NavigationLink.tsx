'use client';

import { ReactNode } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const NavigationLink = ({ href, children, className = '', onClick }: NavigationLinkProps) => {
  const { navigate } = useNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (onClick) {
      onClick();
    }

    navigate(href);
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};