import React, { createContext, useContext, useState } from 'react'

interface SidebarContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className = '' }: SidebarProps) {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('Sidebar must be used within a SidebarProvider')
  }

  const { open } = context

  return (
    <aside className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 ${open ? 'w-64' : 'w-16'} ${className}`}>
      {children}
    </aside>
  )
}

interface SidebarContentProps {
  children: React.ReactNode
  className?: string
}

export function SidebarContent({ children, className = '' }: SidebarContentProps) {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {children}
    </div>
  )
}

interface SidebarHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SidebarHeader({ children, className = '' }: SidebarHeaderProps) {
  return (
    <div className={`p-4 border-b border-gray-700 ${className}`}>
      {children}
    </div>
  )
}

interface SidebarMenuProps {
  children: React.ReactNode
  className?: string
}

export function SidebarMenu({ children, className = '' }: SidebarMenuProps) {
  return (
    <nav className={`flex-1 p-4 space-y-2 ${className}`}>
      {children}
    </nav>
  )
}

interface SidebarMenuItemProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

export function SidebarMenuItem({ children, className = '', asChild = false }: SidebarMenuItemProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: `flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${className}`
    })
  }

  return (
    <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${className}`}>
      {children}
    </div>
  )
}

interface SidebarTriggerProps {
  children: React.ReactNode
  className?: string
}

export function SidebarTrigger({ children, className = '' }: SidebarTriggerProps) {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('SidebarTrigger must be used within a SidebarProvider')
  }

  const { setOpen, open } = context

  return (
    <button
      onClick={() => setOpen(!open)}
      className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ${className}`}
    >
      {children}
    </button>
  )
}

interface SidebarFooterProps {
  children: React.ReactNode
  className?: string
}

export function SidebarFooter({ children, className = '' }: SidebarFooterProps) {
  return (
    <div className={`p-4 border-t border-gray-700 mt-auto ${className}`}>
      {children}
    </div>
  )
}

interface SidebarGroupProps {
  children: React.ReactNode
  className?: string
}

export function SidebarGroup({ children, className = '' }: SidebarGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {children}
    </div>
  )
}

interface SidebarGroupContentProps {
  children: React.ReactNode
  className?: string
}

export function SidebarGroupContent({ children, className = '' }: SidebarGroupContentProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {children}
    </div>
  )
}

interface SidebarGroupLabelProps {
  children: React.ReactNode
  className?: string
}

export function SidebarGroupLabel({ children, className = '' }: SidebarGroupLabelProps) {
  return (
    <div className={`px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider ${className}`}>
      {children}
    </div>
  )
}

interface SidebarMenuButtonProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
  isActive?: boolean
  tooltip?: string
}

export function SidebarMenuButton({ children, className = '', asChild = false, isActive = false, tooltip }: SidebarMenuButtonProps) {
  const baseClasses = `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
    isActive 
      ? 'bg-red-600 text-white' 
      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
  }`

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: `${baseClasses} ${className}`
    })
  }

  return (
    <button className={`${baseClasses} ${className}`}>
      {children}
    </button>
  )
}
