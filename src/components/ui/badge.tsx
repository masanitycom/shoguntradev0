import React from 'react'

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', className = '', children }: BadgeProps) {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  
  const variantClasses = {
    default: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600',
    destructive: 'bg-red-800 text-red-100 hover:bg-red-900',
    outline: 'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  )
}
