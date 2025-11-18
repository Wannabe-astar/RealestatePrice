// ========================================
// 이메일 유효성 검사
// ========================================
export function validateEmail(email) {
  if (!email) {
    return '이메일을 입력해주세요'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return '올바른 이메일 형식이 아닙니다'
  }

  return null
}

// ========================================
// 비밀번호 유효성 검사
// ========================================
export function validatePassword(password) {
  if (!password) {
    return '비밀번호를 입력해주세요'
  }

  if (password.length < 6) {
    return '비밀번호는 6자 이상이어야 합니다'
  }

  return null
}

// ========================================
// 전화번호 유효성 검사
// ========================================
export function validatePhone(phone) {
  if (!phone) {
    return null // 선택사항
  }

  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
  if (!phoneRegex.test(phone.replace(/-/g, ''))) {
    return '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)'
  }

  return null
}

// ========================================
// 필수 입력 검사
// ========================================
export function validateRequired(value, fieldName = '필드') {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName}을(를) 입력해주세요`
  }

  return null
}

// ========================================
// 최소/최대 길이 검사
// ========================================
export function validateLength(value, min, max, fieldName = '입력값') {
  if (!value) {
    return null // 필수 검사는 validateRequired에서
  }

  if (min && value.length < min) {
    return `${fieldName}은(는) ${min}자 이상이어야 합니다`
  }

  if (max && value.length > max) {
    return `${fieldName}은(는) ${max}자 이하여야 합니다`
  }

  return null
}

// ========================================
// 숫자 범위 검사
// ========================================
export function validateRange(value, min, max, fieldName = '값') {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const num = Number(value)

  if (isNaN(num)) {
    return `${fieldName}은(는) 숫자여야 합니다`
  }

  if (min !== undefined && num < min) {
    return `${fieldName}은(는) ${min} 이상이어야 합니다`
  }

  if (max !== undefined && num > max) {
    return `${fieldName}은(는) ${max} 이하여야 합니다`
  }

  return null
}

// ========================================
// 주소 유효성 검사
// ========================================
export function validateAddress(address) {
  if (!address) {
    return '주소를 입력해주세요'
  }

  if (address.length < 5) {
    return '주소를 5자 이상 입력해주세요'
  }

  return null
}

// ========================================
// 가격 유효성 검사
// ========================================
export function validatePrice(price, min = 0) {
  if (!price && price !== 0) {
    return '가격을 입력해주세요'
  }

  const num = Number(price)

  if (isNaN(num)) {
    return '올바른 가격을 입력해주세요'
  }

  if (num < min) {
    return `가격은 ${min.toLocaleString()}원 이상이어야 합니다`
  }

  return null
}

// ========================================
// 날짜 유효성 검사
// ========================================
export function validateDate(date) {
  if (!date) {
    return '날짜를 선택해주세요'
  }

  const dateObj = new Date(date)

  if (isNaN(dateObj.getTime())) {
    return '올바른 날짜를 선택해주세요'
  }

  return null
}

// ========================================
// 복합 유효성 검사 헬퍼
// ========================================
export function combineValidators(...validators) {
  return (value) => {
    for (const validator of validators) {
      const error = validator(value)
      if (error) {
        return error
      }
    }
    return null
  }
}
