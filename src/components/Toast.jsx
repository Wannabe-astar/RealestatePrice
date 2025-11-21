import React, { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

// ========================================
// Toast Component
// ========================================

const Toast = ({ id, message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const typeStyles = {
    success: 'bg-success-light border-success text-success-dark',
    error: 'bg-error-light border-error text-error-dark',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800'
  }

  const icons = {
    success: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
    error: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
    warning: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />,
    info: <Info className="w-5 h-5 sm:w-6 sm:h-6" />
  }

  return (
    <div
      className={`
        flex items-start gap-3 p-4 sm:p-5 rounded-lg border-2 shadow-lg
        min-w-[280px] max-w-md
        animate-slideIn
        ${typeStyles[type] || typeStyles.info}
      `}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type] || icons.info}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-base sm:text-lg font-medium break-words">
          {message}
        </p>
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
        aria-label="닫기"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  )
}

export default Toast
