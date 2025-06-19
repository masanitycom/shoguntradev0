import React, { createContext, useContext, useState } from 'react'

interface SheetContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = createContext<SheetContextType | undefined>(undefined)

interface SheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sheet({ children, open: controlledOpen, onOpenChange }: SheetProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

export function SheetTrigger({ children, asChild, className = '' }: SheetTriggerProps) {
  const context = useContext(SheetContext)
  if (!context) {
    throw new Error('SheetTrigger must be used within a Sheet')
  }

  const { setOpen } = context

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: () => setOpen(true),
      className: className
    })
  }

  return (
    <button onClick={() => setOpen(true)} className={className}>
      {children}
    </button>
  )
}

interface SheetContentProps {
  children: React.ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  className?: string
  style?: React.CSSProperties
}

export function SheetContent({ children, side = 'right', className = '', style }: SheetContentProps) {
  const context = useContext(SheetContext)
  if (!context) {
    throw new Error('SheetContent must be used within a Sheet')
  }

  const { open, setOpen } = context

  if (!open) return null

  const sideClasses = {
    left: 'left-0 top-0 h-full w-80 border-r',
    right: 'right-0 top-0 h-full w-80 border-l',
    top: 'top-0 left-0 w-full h-80 border-b',
    bottom: 'bottom-0 left-0 w-full h-80 border-t'
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => setOpen(false)}
      />
      
      {/* Sheet Content */}
      <div
        className={`fixed z-50 bg-gray-900 border-gray-700 p-6 shadow-lg ${sideClasses[side]} ${className}`}
        style={style}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
        {children}
      </div>
    </>
  )
}

interface SheetHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SheetHeader({ children, className = '' }: SheetHeaderProps) {
  return (
    <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`}>
      {children}
    </div>
  )
}

interface SheetTitleProps {
  children: React.ReactNode
  className?: string
}

export function SheetTitle({ children, className = '' }: SheetTitleProps) {
  return (
    <h2 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h2>
  )
}
