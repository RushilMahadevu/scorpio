"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PromptInputContextType {
  value: string
  onValueChange?: (val: string) => void
  onSubmit?: () => void
  isLoading?: boolean
  disabled?: boolean
}

const PromptInputContext = React.createContext<PromptInputContextType | null>(
  null
)

export function usePromptInput() {
  const context = React.useContext(PromptInputContext)
  return context
}

export interface PromptInputProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (val: string) => void
  onSubmit?: () => void
  isLoading?: boolean
  disabled?: boolean
}

export const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  (
    {
      value = "",
      onValueChange,
      onSubmit,
      isLoading = false,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <PromptInputContext.Provider
        value={{ value, onValueChange, onSubmit, isLoading, disabled }}
      >
        <div
          ref={ref}
          className={cn(
            "relative flex flex-col rounded-3xl border bg-background transition-shadow focus-within:ring-1 focus-within:ring-ring",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </PromptInputContext.Provider>
    )
  }
)
PromptInput.displayName = "PromptInput"

export type PromptInputTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const PromptInputTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptInputTextareaProps
>(
  (
    {
      className,
      onChange,
      onKeyDown,
      value: propValue,
      placeholder = "Ask anything",
      ...props
    },
    ref
  ) => {
    const context = usePromptInput()
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)

    const combinedRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      },
      [ref]
    )

    const value = propValue !== undefined ? propValue : (context?.value ?? "")

    const adjustHeight = React.useCallback(() => {
      const el = textareaRef.current
      if (!el) return
      el.style.height = "auto"
      el.style.height = `${Math.min(Math.max(el.scrollHeight, 44), 220)}px`
    }, [])

    React.useEffect(() => {
      adjustHeight()
    }, [value, adjustHeight])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      context?.onValueChange?.(e.target.value)
      onChange?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (context?.value?.trim() && !context.isLoading && !context.disabled) {
          context.onSubmit?.()
        }
      }
      onKeyDown?.(e)
    }

    return (
      <textarea
        ref={combinedRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={placeholder}
        disabled={context?.disabled || props.disabled}
        className={cn(
          "w-full resize-none bg-transparent px-4 py-3 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
PromptInputTextarea.displayName = "PromptInputTextarea"

export type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>

export const PromptInputActions = React.forwardRef<
  HTMLDivElement,
  PromptInputActionsProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between gap-2 px-3 pb-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
PromptInputActions.displayName = "PromptInputActions"

export interface PromptInputActionProps {
  tooltip?: string
  delayDuration?: number
  children: React.ReactNode
}

export const PromptInputAction = ({
  tooltip,
  delayDuration = 100,
  children,
}: PromptInputActionProps) => {
  if (!tooltip) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
