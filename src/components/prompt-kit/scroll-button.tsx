"use client"

import * as React from "react"
import { ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ScrollButtonProps
  extends React.ComponentProps<typeof Button> {
  containerRef?: React.RefObject<HTMLElement | null>
}

export const ScrollButton = React.forwardRef<
  HTMLButtonElement,
  ScrollButtonProps
>(({ className, containerRef, onClick, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = containerRef?.current
    if (!el) return

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      setVisible(scrollHeight - scrollTop - clientHeight > 120)
    }

    checkScroll()
    el.addEventListener("scroll", checkScroll)
    return () => el.removeEventListener("scroll", checkScroll)
  }, [containerRef])

  const scrollToBottom = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    } else {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      })
    }
    onClick?.(e)
  }

  if (!visible) return null

  return (
    <Button
      ref={ref}
      size="icon"
      variant="outline"
      className={cn(
        "size-8 rounded-full border shadow-md backdrop-blur-md bg-background/90 hover:bg-background transition-all",
        className
      )}
      onClick={scrollToBottom}
      {...props}
    >
      <ArrowDown className="size-4" />
    </Button>
  )
})
ScrollButton.displayName = "ScrollButton"
