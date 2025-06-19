import React from 'react'

interface ShogunIconProps {
  className?: string
  size?: number
}

export function ShogunIcon({ className = '', size = 24 }: ShogunIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
        fill="currentColor"
      />
      <path
        d="M12 18L13.09 20.26L16 21L13.09 21.74L12 24L10.91 21.74L8 21L10.91 20.26L12 18Z"
        fill="currentColor"
      />
    </svg>
  )
}
