import React from 'react'

interface ShogunIconProps {
  className?: string
}

export function ShogunIcon({ className = "h-6 w-6" }: ShogunIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L14 6H18L16 8L17 12L12 10L7 12L8 8L6 6H10L12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M12 10V14M10 14H14M9 16L12 18L15 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 20H16C16.5523 20 17 20.4477 17 21C17 21.5523 16.5523 22 16 22H8C7.44772 22 7 21.5523 7 21C7 20.4477 7.44772 20 8 20Z"
        fill="currentColor"
      />
    </svg>
  )
}
