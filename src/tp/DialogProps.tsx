import React from 'react'

export interface Action {
  label: string
  function: () => void
}

interface Props {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  titleComponent?: React.ReactNode
  withCloseButton?: boolean
  footerComponent?: React.ReactNode
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  borderRadius?: string
  isCentered?: boolean
}

type Dialog = React.FunctionComponent<Props>

export type { Dialog, Props as DialogProps }
