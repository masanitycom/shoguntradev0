import React, { createContext, useContext, useState } from 'react'

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined)

interface DropdownMenuProps {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within a DropdownMenu')
  }

  const { setOpen } = context

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: () => setOpen(true)
    })
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function DropdownMenuContent({ 
  children, 
  align = 'center', 
  side = 'bottom',
  className = '' 
}: DropdownMenuContentProps) {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('DropdownMenuContent must be used within a DropdownMenu')
  }

  const { open, setOpen } = context

  if (!open) return null

  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  }

  const sideClasses = {
    top: 'bottom-full mb-2',
    right: 'left-full ml-2 top-0',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2 top-0'
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => setOpen(false)}
      />
      
      {/* Dropdown Content */}
      <div
        className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-700 bg-gray-900 p-1 text-white shadow-md ${alignClasses[align]} ${sideClasses[side]} ${className}`}
      >
        {children}
      </div>
    </>
  )
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  asChild?: boolean
}

export function DropdownMenuItem({ children, onClick, className = '', asChild = false }: DropdownMenuItemProps) {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('DropdownMenuItem must be used within a DropdownMenu')
  }

  const { setOpen } = context

  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: `relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-800 focus:bg-gray-800 ${className}`,
      onClick: handleClick
    })
  }

  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-800 focus:bg-gray-800 ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}

interface DropdownMenuSeparatorProps {
  className?: string
}

export function DropdownMenuSeparator({ className = '' }: DropdownMenuSeparatorProps) {
  return (
    <div className={`-mx-1 my-1 h-px bg-gray-700 ${className}`} />
  )
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

export function DropdownMenuLabel({ children, className = '' }: DropdownMenuLabelProps) {
  return (
    <div className={`px-2 py-1.5 text-sm font-semibold text-gray-300 ${className}`}>
      {children}
    </div>
  )
}
