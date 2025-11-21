// ========================================
// 가격 포맷팅
// ========================================
export function formatPrice(price, unit = '만원') {
  if (price === null || price === undefined) return '-'

  const num = Number(price)
  if (isNaN(num)) return '-'

  return new Intl.NumberFormat('ko-KR').format(num) + unit
}

// ========================================
// 억/만원 단위로 변환
// ========================================
export function formatPriceKorean(price) {
  if (price === null || price === undefined) return '-'

  const num = Number(price)
  if (isNaN(num)) return '-'

  const billion = Math.floor(num / 10000)
  const million = num % 10000

  if (billion === 0) {
    return `${million.toLocaleString()}만원`
  } else if (million === 0) {
    return `${billion}억원`
  } else {
    return `${billion}억 ${million.toLocaleString()}만원`
  }
}

// ========================================
// 날짜 포맷팅
// ========================================
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '-'

  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'YYYY.MM.DD':
      return `${year}.${month}.${day}`
    case 'YYYY년 MM월 DD일':
      return `${year}년 ${month}월 ${day}일`
    case 'YYYY-MM':
      return `${year}-${month}`
    case 'MM/DD':
      return `${month}/${day}`
    case 'YYYY-MM-DD HH:mm':
      return `${year}-${month}-${day} ${hours}:${minutes}`
    default:
      return `${year}-${month}-${day}`
  }
}

// ========================================
// 상대 시간 포맷팅 (몇 분 전, 몇 시간 전)
// ========================================
export function formatRelativeTime(date) {
  if (!date) return '-'

  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const now = new Date()
  const diffMs = now - d
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return '방금 전'
  } else if (diffMin < 60) {
    return `${diffMin}분 전`
  } else if (diffHour < 24) {
    return `${diffHour}시간 전`
  } else if (diffDay < 7) {
    return `${diffDay}일 전`
  } else {
    return formatDate(date, 'YYYY.MM.DD')
  }
}

// ========================================
// 전화번호 포맷팅
// ========================================
export function formatPhone(phone) {
  if (!phone) return '-'

  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  return phone
}

// ========================================
// 퍼센트 포맷팅
// ========================================
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '-'

  const num = Number(value)
  if (isNaN(num)) return '-'

  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`
}

// ========================================
// 면적 포맷팅 (㎡ / 평)
// ========================================
export function formatArea(area, showPyeong = true) {
  if (area === null || area === undefined) return '-'

  const num = Number(area)
  if (isNaN(num)) return '-'

  const sqm = num.toFixed(2)
  const pyeong = (num / 3.3058).toFixed(1)

  if (showPyeong) {
    return `${sqm}㎡ (${pyeong}평)`
  }

  return `${sqm}㎡`
}

// ========================================
// 숫자를 축약형으로 (1.2K, 3.4M)
// ========================================
export function formatNumber(num, decimals = 1) {
  if (num === null || num === undefined) return '-'

  const n = Number(num)
  if (isNaN(n)) return '-'

  if (n >= 1000000000) {
    return (n / 1000000000).toFixed(decimals) + 'B'
  } else if (n >= 1000000) {
    return (n / 1000000).toFixed(decimals) + 'M'
  } else if (n >= 1000) {
    return (n / 1000).toFixed(decimals) + 'K'
  }

  return n.toString()
}

// ========================================
// 텍스트 말줄임 (ellipsis)
// ========================================
export function truncate(text, maxLength = 50) {
  if (!text) return ''

  if (text.length <= maxLength) {
    return text
  }

  return text.substring(0, maxLength) + '...'
}

// ========================================
// 주소 포맷팅 (시/도 강조)
// ========================================
export function formatAddress(address, highlightCity = false) {
  if (!address) return '-'

  // 시/도만 추출
  const cityMatch = address.match(/^([^ ]+시|[^ ]+도|서울|부산|대구|인천|광주|대전|울산|세종)/)

  if (highlightCity && cityMatch) {
    const city = cityMatch[1]
    const rest = address.substring(city.length).trim()
    return { city, rest, full: address }
  }

  return { full: address }
}
