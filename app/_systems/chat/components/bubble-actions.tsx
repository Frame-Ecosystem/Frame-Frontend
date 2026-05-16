// Minimal placeholder for BubbleActions to unblock build
// TODO: Restore full implementation if needed

// Accept all props for type safety, prefix with _ to satisfy lint rules
export function BubbleActions({
  message: _message,
  isSent: _isSent,
  isEditable: _isEditable,
  show: _show,
  onReply: _onReply,
  onEdit: _onEdit,
  onDelete: _onDelete,
  onTogglePicker: _onTogglePicker,
}: {
  message: any
  isSent: boolean
  isEditable: boolean
  show: boolean
  onReply: () => void
  onEdit: () => void
  onDelete: (recallForAll: boolean) => void
  onTogglePicker: () => void
}) {
  return null
}
