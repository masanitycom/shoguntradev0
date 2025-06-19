import React from 'react'

export const buttonVariants = (options?: { 
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}) => {
  const variant = options?.variant || 'default'
  const size = options?.size || 'default'
  
  const variants = {
    default: 'samurai-button text-white',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    ghost: 'hover:bg-gray-800 text-white',
    link: 'underline-offset-4 hover:underline text-red-400'
  }
  
  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10'
  }
  
  return `${variants[variant]} ${sizes[size]}`
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  children, 
  asChild = false,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background'
  
  const variantClasses = {
    default: 'samurai-button text-white',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
    ghost: 'hover:bg-gray-800 text-white',
    link: 'underline-offset-4 hover:underline text-red-400'
  }
  
  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10'
  }
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`,
      ...props
    })
  }

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"
