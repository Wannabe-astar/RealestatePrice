import React from 'react'

const Input = ({
  label,
  type = 'text',
  error,
  placeholder,
  value,
  onChange,
  className = '',
  required = false,
  name
}) => {
  const inputClasses = error
    ? 'input-large w-full border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 placeholder-gray-500'
    : 'input-large w-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-500'

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-lg font-medium text-text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={inputClasses}
      />
      {error && (
        <p className="mt-2 text-base text-error">{error}</p>
      )}
    </div>
  )
}

export default Input
