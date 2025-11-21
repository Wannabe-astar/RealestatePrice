import { useState, useCallback } from 'react'
import { combineValidators } from '../utils/validation'

// ========================================
// useForm - Form State Management Hook
// ========================================

/**
 * Form state management hook with validation
 * @param {object} initialValues - Initial form values
 * @param {object} validationSchema - Validation schema { fieldName: [validator1, validator2] }
 * @param {function} onSubmit - Submit handler function
 * @returns {object} - Form state and handlers
 */
export function useForm(initialValues = {}, validationSchema = {}, onSubmit) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    const fieldValue = type === 'checkbox' ? checked : value

    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }, [errors])

  // Handle input blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target

    setTouched(prev => ({
      ...prev,
      [name]: true
    }))

    // Validate field on blur
    if (validationSchema[name]) {
      const validators = Array.isArray(validationSchema[name])
        ? validationSchema[name]
        : [validationSchema[name]]

      const validator = combineValidators(...validators)
      const error = validator(values[name])

      if (error) {
        setErrors(prev => ({
          ...prev,
          [name]: error
        }))
      }
    }
  }, [validationSchema, values])

  // Set field value programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  // Set field error programmatically
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }, [])

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {}

    Object.keys(validationSchema).forEach(fieldName => {
      const validators = Array.isArray(validationSchema[fieldName])
        ? validationSchema[fieldName]
        : [validationSchema[fieldName]]

      const validator = combineValidators(...validators)
      const error = validator(values[fieldName])

      if (error) {
        newErrors[fieldName] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [validationSchema, values])

  // Handle form submit
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault()
    }

    // Mark all fields as touched
    const allTouched = {}
    Object.keys(values).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)

    // Validate form
    const isValid = validateForm()

    if (!isValid) {
      return
    }

    // Submit form
    setIsSubmitting(true)

    try {
      if (onSubmit) {
        await onSubmit(values)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validateForm, onSubmit])

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  // Get field props for input binding
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur
  }), [values, handleChange, handleBlur])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    getFieldProps,
    isValid: Object.keys(errors).length === 0
  }
}

// ========================================
// useFormField - Individual Field Hook
// ========================================

/**
 * Individual form field hook
 * @param {any} initialValue - Initial field value
 * @param {array} validators - Array of validator functions
 * @returns {object} - Field state and handlers
 */
export function useFormField(initialValue = '', validators = []) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)

  const validate = useCallback(() => {
    if (validators.length === 0) {
      return true
    }

    const validator = combineValidators(...validators)
    const validationError = validator(value)

    setError(validationError)
    return !validationError
  }, [value, validators])

  const handleChange = useCallback((e) => {
    const newValue = e.target.value
    setValue(newValue)

    // Clear error when user types
    if (error) {
      setError(null)
    }
  }, [error])

  const handleBlur = useCallback(() => {
    setTouched(true)
    validate()
  }, [validate])

  const reset = useCallback(() => {
    setValue(initialValue)
    setError(null)
    setTouched(false)
  }, [initialValue])

  return {
    value,
    error,
    touched,
    setValue,
    setError,
    handleChange,
    handleBlur,
    validate,
    reset,
    isValid: !error
  }
}

// ========================================
// useMultiStepForm - Multi-Step Form Hook
// ========================================

/**
 * Multi-step form hook
 * @param {array} steps - Array of step components
 * @param {object} initialValues - Initial form values for all steps
 * @returns {object} - Multi-step form state and handlers
 */
export function useMultiStepForm(steps = [], initialValues = {}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(initialValues)
  const [completedSteps, setCompletedSteps] = useState([])

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])])
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, isLastStep])

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep, isFirstStep])

  const goToStep = useCallback((step) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step)
    }
  }, [steps.length])

  const updateFormData = useCallback((stepData) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }))
  }, [])

  const resetForm = useCallback(() => {
    setCurrentStep(0)
    setFormData(initialValues)
    setCompletedSteps([])
  }, [initialValues])

  return {
    currentStep,
    currentStepComponent: steps[currentStep],
    formData,
    isFirstStep,
    isLastStep,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    updateFormData,
    resetForm,
    progress: ((currentStep + 1) / steps.length) * 100
  }
}
