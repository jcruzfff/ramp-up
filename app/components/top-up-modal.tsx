"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { X } from "lucide-react"

interface TopUpModalProps {
  isOpen: boolean
  onCloseAction?: () => void
  onTopUpAction: (amount: number) => void
  currentBalance?: number
}

export function TopUpModal({ isOpen, onCloseAction, onTopUpAction, currentBalance = 0 }: TopUpModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(5)
  const modalRef = useRef<HTMLDivElement>(null)
  
  const amounts = [1, 5, 10, 20]

  // Handle close action
  const handleClose = useCallback(() => {
    if (onCloseAction) {
      onCloseAction();
    }
  }, [onCloseAction]);

  // Add escape key listener
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        console.log("Escape key pressed - attempting to close");
        handleClose();
      }
    };

    // Only add the event listener on the client
    if (typeof window !== 'undefined' && isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
 
    // Clean up
    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('keydown', handleEscape);
      }
    };
  }, [isOpen, handleClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onTopUpAction(selectedAmount)
  }

  // Handler to ensure the close function is properly called
  const handleButtonClose = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    console.log("Close button clicked/touched");
    e.preventDefault();
    e.stopPropagation();
    handleClose();
  }
  
  // Close when clicking outside the modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    console.log("Overlay clicked");
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  }

  // Alternative close method using a direct element
  const closeWithDiv = () => {
    console.log("Close div clicked");
    handleClose();
  };

  // Don't render anything if the modal is closed
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" 
      onClick={handleOverlayClick}
    >
      <Card ref={modalRef} className="w-full max-w-md mx-4 p-6 relative">
        {/* Standard button that might not work */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 hidden md:flex" 
          onClick={handleButtonClose}
          type="button"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
        
        {/* DIV-based close button that should work everywhere */}
        <div 
          onClick={closeWithDiv}
          className="absolute top-2 right-2 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer touch-manipulation"
          role="button"
          tabIndex={0}
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </div>
        
        <h2 className="text-xl font-bold mb-4">Add Balance</h2>
        
        {currentBalance === 0 ? (
          <p className="text-sm text-slate-600 mb-4">
            Your balance is empty. Add funds to continue donating to projects.
          </p>
        ) : (
          <p className="text-sm text-slate-600 mb-4">
            Your current balance: <span className="font-medium">${currentBalance.toFixed(2)}</span>
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {amounts.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`py-3 px-4 border rounded-lg text-center ${
                  selectedAmount === amount
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setSelectedAmount(amount)}
              >
                <span className="block text-lg font-medium">${amount}</span>
                <span className="text-xs text-slate-500">Add to balance</span>
              </button>
            ))}
          </div>
          
          <Button type="submit" className="w-full">
            Add ${selectedAmount}
          </Button>
          
          <p className="text-xs text-center text-slate-500 mt-4">
            Funds added to your balance can be used to donate to projects of your choice.
          </p>
        </form>
      </Card>
    </div>
  )
}
