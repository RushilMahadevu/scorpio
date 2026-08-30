"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ChatContainerRootProps = React.HTMLAttributes<HTMLDivElement>

export const ChatContainerRoot = React.forwardRef<
  HTMLDivElement,
  ChatContainerRootProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-full w-full flex-col overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ChatContainerRoot.displayName = "ChatContainerRoot"

export type ChatContainerContentProps = React.HTMLAttributes<HTMLDivElement>

export const ChatContainerContent = React.forwardRef<
  HTMLDivElement,
  ChatContainerContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-1 flex-col justify-start space-y-6 px-4 py-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ChatContainerContent.displayName = "ChatContainerContent"
