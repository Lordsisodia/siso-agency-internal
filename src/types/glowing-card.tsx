"use client" 

import * as React from "react"
import { cn } from "@/lib/utils"

interface GridBackgroundProps {
  title: string
  description: string
  showAvailability?: boolean
  className?: string
  children?: React.ReactNode
}

export function GridBackground({
  title,
  description,
  showAvailability = true,
  className,
  children,
}: GridBackgroundProps) {
  return (
    <div 
      className={cn(
        'px-10 py-20 rounded-md relative mx-auto flex items-center justify-center',
        className
      )}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backgroundImage: `
          linear-gradient(rgba(255, 167, 38, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 167, 38, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}
    >
      <div 
        className="w-3 h-3 rounded-full absolute shadow-[0_0_15px] shadow-current z-10 bg-current"
        style={{
          animation: `
            border-follow 8s linear infinite,
            siso-color-change 8s linear infinite
          `
        }}
      />
      <div 
        className="absolute inset-0 border-2 rounded-md"
        style={{
          animation: 'siso-border-color-change 8s linear infinite'
        }}
      />

      <div className="relative z-20 text-center max-w-4xl">
        <h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>{title}</h1>
        {description && (
          <p className='text-lg mt-5 text-gray-300 mb-8'>{description}</p>
        )}

        {showAvailability && (
          <div className="available-now text-siso-orange text-sm flex items-center justify-center mb-8">
            <div className="w-2 h-2 bg-siso-orange rounded-full inline-block mr-2 animate-pulse shadow-[0_0_8px_#FFA726]" />
            Available Now - Premium Development
          </div>
        )}

        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </div>
  )
} 