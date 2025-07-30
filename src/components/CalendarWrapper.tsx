"use client"

import { CalendarProvider } from '@/src/contexts/CalendarContext'
import { ReactNode } from 'react'

export function CalendarWrapper({ children }: { children: ReactNode }) {
  return <CalendarProvider>{children}</CalendarProvider>
}