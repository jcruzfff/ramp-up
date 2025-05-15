"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback,
  ReactNode 
} from "react"
import { toast } from "sonner"

interface Transaction {
  id: string
  amount: number
  projectId: string
  projectTitle: string
  timestamp: number
}

interface BatchTransactionContextType {
  pendingTransactions: Transaction[]
  processingBatch: boolean
  addTransaction: (amount: number, projectId: string, projectTitle: string) => string
  cancelTransaction: (id: string) => void
  clearTransactions: () => void
} 

const BatchTransactionContext = createContext<BatchTransactionContextType | undefined>(undefined)

export function BatchTransactionProvider({ children }: { children: ReactNode }) {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([])
  const [processingBatch, setProcessingBatch] = useState(false)
  const [batchTimer, setBatchTimer] = useState<NodeJS.Timeout | null>(null)

  // Process the batch of transactions
  const processTransactions = useCallback(async () => {
    if (pendingTransactions.length === 0) return
    
    setProcessingBatch(true)
    
    try {
      // In a real app, this would be an API call to process the batch
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Success notification
      toast.success(`${pendingTransactions.length} donation${pendingTransactions.length !== 1 ? 's' : ''} processed!`, {
        description: "Thank you for supporting these projects",
      })
      
      // Clear the transactions
      setPendingTransactions([])
    } catch {
      toast.error("Failed to process donations", {
        description: "Please try again later",
      })
    } finally {
      setProcessingBatch(false)
      setBatchTimer(null)
    }
  }, [pendingTransactions]);

  // Process transactions in batches
  useEffect(() => {
    if (pendingTransactions.length > 0 && !processingBatch && !batchTimer) {
      // Wait 5 seconds before processing the batch
      const timer = setTimeout(() => {
        processTransactions()
      }, 5000)
      
      setBatchTimer(timer)
      
      return () => {
        if (timer) clearTimeout(timer)
      }
    }
  }, [pendingTransactions, processingBatch, batchTimer, processTransactions])

  // Add a transaction to the batch
  const addTransaction = (amount: number, projectId: string, projectTitle: string): string => {
    const txId = Math.random().toString(36).substring(2, 15)
    
    setPendingTransactions(prev => [
      ...prev,
      {
        id: txId,
        amount,
        projectId,
        projectTitle,
        timestamp: Date.now()
      }
    ])
    
    return txId
  }

  // Cancel a specific transaction
  const cancelTransaction = (id: string) => {
    setPendingTransactions(prev => prev.filter(tx => tx.id !== id))
    
    toast.info("Donation canceled", {
      description: "The donation has been removed from the batch",
    })
  }

  // Clear all pending transactions
  const clearTransactions = () => {
    setPendingTransactions([])
    if (batchTimer) {
      clearTimeout(batchTimer)
      setBatchTimer(null)
    }
  }

  return (
    <BatchTransactionContext.Provider
      value={{
        pendingTransactions,
        processingBatch,
        addTransaction,
        cancelTransaction,
        clearTransactions
      }}
    >
      {children}
    </BatchTransactionContext.Provider>
  )
}

export function useBatchTransactions() {
  const context = useContext(BatchTransactionContext)
  if (context === undefined) {
    throw new Error("useBatchTransactions must be used within a BatchTransactionProvider")
  }
  return context
}
