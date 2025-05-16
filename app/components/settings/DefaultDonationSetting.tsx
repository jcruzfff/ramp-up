"use client"
import { useState, useEffect } from 'react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useStellarClient } from '@/app/hooks/useStellarClient'

const PRESET_AMOUNTS = [
  { label: "$.01", value: 0.01 },
  { label: "$.10", value: 0.1 },
  { label: "$.50", value: 0.5 },
  { label: "$1", value: 1 }
]

interface DefaultDonationSettingProps {
  onDonationChange: (amount: number) => void
  initialAmount?: number
}

export function DefaultDonationSetting({ 
  onDonationChange,
  initialAmount = 0.1 
}: DefaultDonationSettingProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(initialAmount)
  const [customAmount, setCustomAmount] = useState<boolean>(false)
  const [sliderValue, setSliderValue] = useState<number>(initialAmount)
  const [inputValue, setInputValue] = useState<string>(initialAmount.toString())
  const { getAccountBalance } = useStellarClient()
  const [balance, setBalance] = useState<string>("0")

  useEffect(() => {
    // Fetch account balance when component mounts
    const fetchBalance = async () => {
      try {
        const accountBalance = await getAccountBalance()
        setBalance(accountBalance?.toString() || "0")
      } catch (error) {
        console.error("Failed to fetch account balance:", error)
      }
    }

    fetchBalance()
  }, [getAccountBalance])

  // Update donation amount when selection changes
  useEffect(() => {
    onDonationChange(selectedAmount)
  }, [selectedAmount, onDonationChange])

  const handlePresetClick = (value: number) => {
    setSelectedAmount(value)
    setSliderValue(value)
    setInputValue(value.toString())
    setCustomAmount(false)
  }

  const handleSliderChange = (value: number[]) => {
    const newValue = value[0] || 0
    setSliderValue(newValue)
    setSelectedAmount(newValue)
    setInputValue(newValue.toFixed(2))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    const numberValue = parseFloat(newValue)
    if (!isNaN(numberValue)) {
      setSelectedAmount(numberValue)
      setSliderValue(numberValue)
    }
  }

  const handleCustomToggle = (checked: boolean) => {
    setCustomAmount(checked)
  }

  return (
    <div className="flex flex-col gap-6 p-4 bg-white rounded-lg border border-slate-200 bento-bevel">
      {/* Balance Display */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Amount Available</h3>
        <span className="font-medium">{balance} XLM</span>
      </div>

      {/* Swipe Settings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Swipe Settings</h3>
        <p className="text-slate-500">Default donation amount</p>
        
        {/* Preset Amount Buttons */}
        <div className="flex gap-2 flex-wrap">
          {PRESET_AMOUNTS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => handlePresetClick(value)}
              className={`px-6 py-2 rounded-full text-center ${
                !customAmount && selectedAmount === value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-black"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom Amount Toggle */}
        <div className="flex items-center justify-between pt-4">
          <Label htmlFor="custom-amount" className="font-medium">
            Custom Amount
          </Label>
          <Switch 
            id="custom-amount" 
            checked={customAmount} 
            onCheckedChange={handleCustomToggle}
          />
        </div>

        {/* Slider and Input for Custom Amount */}
        {customAmount && (
          <div className="flex items-center gap-4">
            <Slider
              className="flex-1"
              min={0.01}
              max={10}
              step={0.01}
              value={[sliderValue]}
              onValueChange={handleSliderChange}
            />
            <div className="w-32 bg-gray-100 rounded-lg p-2">
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={inputValue}
                onChange={handleInputChange}
                className="border-0 bg-transparent focus:ring-0 text-center"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 