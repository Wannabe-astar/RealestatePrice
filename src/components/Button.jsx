import React from 'react'

const Button = ({
  variant = 'primary',
  size = 'large',
  disabled = false,
  onClick,
  className = '',
  children,
  type = 'button'
}) => {
  const baseClasses = 'btn-large font-semibold transition-colors duration-200 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 text-white',
    secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 border border-gray-300 text-gray-700',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-gray-300 text-white'
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button
