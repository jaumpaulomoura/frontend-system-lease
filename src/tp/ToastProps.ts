import React, { ReactNode } from 'react'

type ToastStatus =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'shoppingCartLimit'
interface Props {
  title: string
  description: string
  status: ToastStatus
  footerComponent?: ReactNode
}

type Toast = React.FunctionComponent<Props>

export type { Toast, Props as ToastProps, ToastStatus }
