import { Action } from './DialogProps'

export interface DeleteFooterProps {
  confirmAction: Action
  cancelAction: Action
}

export interface DeleteDialogProps {
  title: string
  description?: string
  onClose: () => void
  confirmAction: Action
  cancelAction: Action
  isOpen: boolean
}

export interface DialogContentProps {
  title: string
  description?: string
}
