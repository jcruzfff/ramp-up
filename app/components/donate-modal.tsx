"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatCurrency, getUserSettings } from "@/lib/utils"
import { useEffect, useState } from "react"

interface DonateModalProps {
  isOpen: boolean
  onCloseAction: () => void
  onConfirmAction: () => void
  amount: number
}

export function DonateModal({ isOpen, onCloseAction, onConfirmAction, amount }: DonateModalProps) {
  const [userSettings, setUserSettings] = useState({ currency: "CENTS", language: "en", region: "US" })

  useEffect(() => {
    // Cargar configuración del usuario
    setUserSettings(getUserSettings())
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm bento-bevel">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-center mb-2"> 
            Confirm {formatCurrency(amount || 0.01, userSettings.currency)} donation?
          </h2>
          <p className="text-center text-blue-500">+5 pts earned</p>
        </CardContent>
        <CardFooter className="flex gap-4 justify-between">
          <Button variant="secondary" className="flex-1" onClick={onCloseAction}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onConfirmAction}>
            Confirm
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
