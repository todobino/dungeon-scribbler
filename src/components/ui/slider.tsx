
"use client"

import * as React from "react"
import *  as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, value, defaultValue, ...props }, ref) => {
  // Determine the number of thumbs based on the value or defaultValue prop.
  // If value is an array, use its length.
  // Else if defaultValue is an array, use its length.
  // Otherwise, default to 1 thumb.
  const currentVal = value !== undefined ? value : defaultValue;
  const thumbsArray = Array.isArray(currentVal) ? currentVal : (currentVal !== undefined ? [currentVal] : [0]);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      value={Array.isArray(value) ? value : (value !== undefined ? [value] : undefined)} // Pass array if it's a range
      defaultValue={Array.isArray(defaultValue) ? defaultValue : (defaultValue !== undefined ? [defaultValue] : undefined)} // Pass array if it's a range
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {thumbsArray.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
