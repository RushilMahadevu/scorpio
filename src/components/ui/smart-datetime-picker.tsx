'use client'

import { useState, useEffect } from 'react'
import { parseDate } from 'chrono-node'
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface SmartDateTimePickerProps {
  value?: string // The datetime string (e.g. ISO)
  onChange?: (date: Date | undefined) => void
  label?: string
  placeholder?: string
}

export function SmartDateTimePicker({
  value: initialValue,
  onChange,
  label = 'Due Date',
  placeholder = 'e.g. Next Fri at 5pm'
}: SmartDateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [date, setDate] = useState<Date | undefined>(
    initialValue ? new Date(initialValue) : undefined
  )
  const [month, setMonth] = useState<Date | undefined>(date || new Date())
  const [isValid, setIsValid] = useState(true)

  // Sync internal state with external value if it changes
  useEffect(() => {
    if (initialValue) {
      const d = new Date(initialValue)
      if (!isNaN(d.getTime())) {
        setDate(d)
        // If we're not currently typing, update the input value too
        // but normally we want the input value to be natural language
      }
    }
  }, [initialValue])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    if (!val) {
      setIsValid(true)
      return
    }

    const parsedDate = parseDate(val)

    if (parsedDate) {
      setIsValid(true)
      setDate(parsedDate)
      setMonth(parsedDate)
      onChange?.(parsedDate)
    } else {
      setIsValid(false)
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    // Preserve time from current date if it exists
    const newDate = new Date(selectedDate)
    if (date) {
      newDate.setHours(date.getHours())
      newDate.setMinutes(date.getMinutes())
      newDate.setSeconds(date.getSeconds())
    }

    setDate(newDate)
    setInputValue(format(newDate, 'PPP p'))
    setIsValid(true)
    onChange?.(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeVal = e.target.value // HH:mm
    if (!timeVal) return

    const [hours, minutes] = timeVal.split(':').map(Number)
    const newDate = date ? new Date(date) : new Date()
    newDate.setHours(hours)
    newDate.setMinutes(minutes)
    newDate.setSeconds(0)

    setDate(newDate)
    setInputValue(format(newDate, 'PPP p'))
    setIsValid(true)
    onChange?.(newDate)
  }

  const formatDisplayDate = (d: Date | undefined) => {
    if (!d) return 'Not set'
    return format(d, 'PPP p')
  }

  return (
    <div className='w-full space-y-2'>
      <Label htmlFor='datetime-picker' className='px-1 text-sm font-medium'>
        {label}
      </Label>
      <div className='relative flex gap-2'>
        <Input
          id='datetime-picker'
          value={inputValue}
          placeholder={placeholder}
          className={cn(
            'bg-background pr-10 border-zinc-200 focus:ring-primary/20 transition-colors',
            !isValid && 'border-destructive focus:ring-destructive/20 pr-16'
          )}
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        {!isValid && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='absolute top-1/2 right-10 -translate-y-1/2'>
                  <AlertCircle className='size-4 text-destructive animate-pulse' />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Could not parse date</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id='date-picker-trigger'
              variant='ghost'
              size="icon"
              className='absolute top-1/2 right-1 size-8 -translate-y-1/2 hover:bg-zinc-100'
            >
              <CalendarIcon className='size-4 text-zinc-500' />
              <span className='sr-only'>Pick date and time</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='end' sideOffset={8}>
            <div className="flex flex-col">
              <Calendar
                mode='single'
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={handleDateSelect}
                initialFocus
              />
              <div className="border-t p-3 bg-zinc-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                  <Clock className="size-4" />
                  Time
                </div>
                <Input
                  type="time"
                  className="w-32 h-8 text-sm"
                  value={date ? format(date, 'HH:mm') : ''}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className='text-xs text-zinc-900 dark:text-zinc-100 px-1 italic'>
        <span className='font-semibold not-italic'>{formatDisplayDate(date)}</span>
      </div>
    </div>
  )
}
