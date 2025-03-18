/* eslint-disable @typescript-eslint/no-explicit-any */

import { UseFormReturn } from 'react-hook-form'

type SectionForm = {
  name: string
  order: number
}

export interface FormDrawerProps {
  isOpen: boolean
  onClose: () => void
  direction?: 'top' | 'left' | 'bottom' | 'right' | 'start' | 'end'
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  handleSubmit: any
  onSubmit: any
  form: UseFormReturn<SectionForm | any | undefined>
}
