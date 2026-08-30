"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: "user" | "assistant" | "system"
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("group flex w-full flex-col gap-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Message.displayName = "Message"

export interface MessageContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  markdown?: boolean
  children?: React.ReactNode
}

export const MessageContent = React.forwardRef<
  HTMLDivElement,
  MessageContentProps
>(({ className, markdown, children, ...props }, ref) => {
  if (markdown && typeof children === "string") {
    return (
      <div
        ref={ref}
        className={cn(
          "text-foreground max-w-none text-[15px] leading-relaxed",
          className
        )}
        {...props}
      >
        <MarkdownRenderer>{children}</MarkdownRenderer>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn("text-foreground text-[15px] leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  )
})
MessageContent.displayName = "MessageContent"

export type MessageActionsProps = React.HTMLAttributes<HTMLDivElement>

export const MessageActions = React.forwardRef<
  HTMLDivElement,
  MessageActionsProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
MessageActions.displayName = "MessageActions"

export interface MessageActionProps {
  tooltip?: string
  delayDuration?: number
  children: React.ReactNode
}

export const MessageAction = ({
  tooltip,
  delayDuration = 100,
  children,
}: MessageActionProps) => {
  if (!tooltip) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
