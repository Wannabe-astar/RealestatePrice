import React from 'react'

const Card = ({
  variant = 'default',
  children,
  className = '',
  onClick
}) => {
  const baseClasses = 'bg-white border border-gray-200 rounded-xl p-6'

  const variantClasses = {
    default: 'shadow-sm',
    hover: 'shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer'
  }

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
