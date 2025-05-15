'use client';

import { useAuth } from '@/app/hooks/useAuth';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import LogoutButton from './LogoutButton';

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className = '' }: UserProfileProps) {
  const { isAuthenticated, isLoading, getUserName, getUserEmail, getUserAvatar } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (isLoading) {
    return <div className={`animate-pulse bg-gray-200 h-10 w-40 rounded ${className}`} />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const name = getUserName();
  const email = getUserEmail();
  const avatar = getUserAvatar();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200">
          {avatar ? (
            <Image
              src={avatar}
              alt={`${name}'s avatar`}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-blue-100 text-blue-500">
              {name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="font-medium">{name}</p>
          {email && <p className="text-sm text-gray-500">{email}</p>}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
            <p className="font-medium">{name}</p>
            {email && <p className="text-sm text-gray-500">{email}</p>}
          </div>
          <a 
            href="/dashboard" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </a>
          <div className="px-4 py-2 border-t border-gray-100">
            <LogoutButton className="w-full justify-start" />
          </div>
        </div>
      )}
    </div>
  );
} 