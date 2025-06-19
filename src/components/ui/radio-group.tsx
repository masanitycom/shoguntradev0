import React, { createContext, useContext } from 'react'

interface RadioGroupContextType {
  value?: string
  onValueChange?: (value: string) => void
  name?: string
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined)

interface RadioGroupProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function RadioGroup({ value, defaultValue, onValueChange, className = '', children }: RadioGroupProps) {
  const name = React.useId()
  
  return (
    <RadioGroupContext.Provider value={{ value: value || defaultValue, onValueChange, name }}>
      <div className={`grid gap-2 ${className}`} role="radiogroup">
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps {
  value: string
  id?: string
  className?: string
  children?: React.ReactNode
}

export function RadioGroupItem({ value, id, className = '', children }: RadioGroupItemProps) {
  const context = useContext(RadioGroupContext)
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup')
  }
  
  const { value: groupValue, onValueChange, name } = context
  const isChecked = groupValue === value
  const itemId = id || `${name}-${value}`
  
  return (
    <div className="flex items-center space-x-2">
      <input
        type="radio"
        id={itemId}
        name={name}
        value={value}
        checked={isChecked}
        onChange={() => onValueChange?.(value)}
        className="h-4 w-4 border border-gray-600 bg-gray-800 text-red-600 focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-black"
      />
      {children && (
        <label htmlFor={itemId} className="text-sm font-medium text-white cursor-pointer">
          {children}
        </label>
      )}
    </div>
  )
}
