// ========================================
// 사용자 친화적 에러 메시지
// ========================================
const ERROR_MESSAGES = {
  // Supabase 에러
  'PGRST116': '데이터를 찾을 수 없습니다',
  '23505': '이미 존재하는 데이터입니다',
  '23503': '참조된 데이터를 삭제할 수 없습니다',

  // 인증 에러
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
  'Email not confirmed': '이메일 인증이 필요합니다',
  'User already registered': '이미 가입된 이메일입니다',
  'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다',

  // 네트워크 에러
  'Failed to fetch': '네트워크 연결을 확인해주세요',
  'Network request failed': '네트워크 연결을 확인해주세요',
  'timeout': '요청 시간이 초과되었습니다',

  // 기본 에러
  'default': '오류가 발생했습니다. 잠시 후 다시 시도해주세요'
}

// ========================================
// 에러 메시지 변환
// ========================================
export function getErrorMessage(error) {
  if (typeof error === 'string') {
    // 직접 메시지 검색
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.includes(key)) {
        return message
      }
    }
    return error
  }

  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code]
  }

  if (error?.message) {
    // 메시지에서 키워드 검색
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.includes(key)) {
        return message
      }
    }
    return error.message
  }

  return ERROR_MESSAGES.default
}

// ========================================
// 에러 로깅
// ========================================
export function logError(error, context = '') {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    context,
    message: error?.message || error,
    stack: error?.stack,
    code: error?.code
  }

  console.error('Error:', errorInfo)

  // 프로덕션에서는 Sentry 등으로 전송
  // if (import.meta.env.PROD) {
  //   sendToErrorTracking(errorInfo)
  // }
}

// ========================================
// try-catch 헬퍼
// ========================================
export async function tryCatch(fn, errorCallback) {
  try {
    return await fn()
  } catch (error) {
    logError(error, fn.name)

    if (errorCallback) {
      errorCallback(getErrorMessage(error))
    }

    return null
  }
}

// ========================================
// 에러 바운더리용 헬퍼
// ========================================
export function handleError(error, errorInfo) {
  logError(error, errorInfo?.componentStack || '')

  // 사용자에게 표시할 메시지
  return {
    title: '오류가 발생했습니다',
    message: getErrorMessage(error),
    canRetry: true
  }
}
