'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <AvatarPrimitive.Root ref={ref} className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ''}`} {...props} />
  )
)
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(
  ({ className, ...props }, ref) => {
    const [imgError, setImgError] = React.useState(false)
    if (imgError) return null
    return <AvatarPrimitive.Image ref={ref} {...props} className={`aspect-square h-full w-full ${className || ''}`} onError={() => setImgError(true)} />
  }
)
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(
  ({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={`flex h-full w-full items-center justify-center rounded-full text-white font-medium ${className || 'bg-gray-300'}`}
      {...props}
    />
  )
)
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
