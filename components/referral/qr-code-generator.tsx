"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeGeneratorProps {
  value: string
  size?: number
  className?: string
}

export function QRCodeGenerator({ value, size = 200, className }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#FFFFFF',
          light: '#000000'
        }
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error)
        }
      })
    }
  }, [value, size])

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="p-4 bg-white rounded-lg">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
