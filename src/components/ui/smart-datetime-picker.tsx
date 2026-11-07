'use client'

import { useState, useEffect, useRef } from 'react'
import { parseDate } from 'chrono-node'
import { CalendarIcon, Clock } from 'lucide-react'
import { format } from 'date-fns'

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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.setCustomValidity(isValid ? '' : 'Enter a date or choose one from the calendar.')
  }, [isValid])

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

    if (!val.trim()) {
      setIsValid(true)
      setDate(undefined)
      onChange?.(undefined)
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

  return (
    <div className='w-full space-y-2'>
      <Label htmlFor='datetime-picker'>
        {label}
      </Label>
      <div className='relative flex gap-2'>
        <Input
          id='datetime-picker'
          ref={inputRef}
          value={inputValue}
          placeholder={placeholder}
          className='pr-10'
          aria-invalid={!isValid}
          aria-describedby='datetime-picker-help'
          onChange={handleInputChange}
          onKeyDown={e => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size="icon"
              className='absolute top-1/2 right-1 size-8 -translate-y-1/2 text-muted-foreground'
            >
              <CalendarIcon className='size-4' />
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
              <div className="flex items-center justify-between gap-4 border-t bg-muted/30 p-3">
                <Label htmlFor="datetime-picker-time" className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4" />
                  Time
                </Label>
                <Input
                  id="datetime-picker-time"
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
      <p id='datetime-picker-help' className={cn('text-xs text-muted-foreground', !isValid && 'text-destructive')}>
        {!isValid
          ? 'Enter a date or choose one from the calendar.'
          : date ? format(date, 'PPP p') : 'Due when you create it if left blank.'}
      </p>
    </div>
  )
}
