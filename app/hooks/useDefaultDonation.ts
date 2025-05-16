'use client';

import { useState, useEffect, useCallback } from 'react';

const DEFAULT_DONATION_AMOUNT = 0.1;
const STORAGE_KEY = 'default-donation-amount';

export function useDefaultDonation() {
  const [donationAmount, setDonationAmount] = useState<number>(DEFAULT_DONATION_AMOUNT);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load the stored donation amount on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAmount = localStorage.getItem(STORAGE_KEY);
        if (storedAmount) {
          const parsedAmount = parseFloat(storedAmount);
          setDonationAmount(parsedAmount);
        }
      } catch (error) {
        console.error('Error loading donation amount from localStorage:', error);
      } finally {
        setIsInitialized(true);
      }
    }
  }, []);

  // Save donation amount when it changes
  const updateDonationAmount = useCallback((amount: number) => {
    setDonationAmount(amount);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, amount.toString());
      } catch (error) {
        console.error('Error saving donation amount to localStorage:', error);
      }
    }
  }, []);

  return {
    donationAmount,
    updateDonationAmount,
    isInitialized
  };
} 