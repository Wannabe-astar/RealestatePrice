// ========================================
// API Service - External API Calls
// ========================================

/**
 * Generic external API call helper
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<{data: any, error: any}>}
 */
export async function callExternalAPI(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return { data, error: null }
  } catch (err) {
    console.error('API call failed:', err)
    return { data: null, error: err }
  }
}

// ========================================
// Kakao Address Search API
// ========================================

/**
 * 카카오 주소 검색 API
 * @param {string} query - 검색할 주소
 * @param {string} apiKey - 카카오 REST API 키
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function searchAddress(query, apiKey) {
  if (!query || query.trim().length < 2) {
    return { data: [], error: { message: '검색어를 2자 이상 입력해주세요.' } }
  }

  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `KakaoAK ${apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error('주소 검색에 실패했습니다.')
    }

    const result = await response.json()

    const addresses = result.documents.map(doc => ({
      address: doc.address_name,
      roadAddress: doc.road_address?.address_name || '',
      buildingName: doc.road_address?.building_name || '',
      zonecode: doc.road_address?.zone_no || '',
      x: parseFloat(doc.x),
      y: parseFloat(doc.y)
    }))

    return { data: addresses, error: null }
  } catch (err) {
    console.error('Address search failed:', err)
    return { data: [], error: err }
  }
}

/**
 * 카카오 좌표로 주소 검색 API
 * @param {number} longitude - 경도
 * @param {number} latitude - 위도
 * @param {string} apiKey - 카카오 REST API 키
 * @returns {Promise<{data: any, error: any}>}
 */
export async function coord2Address(longitude, latitude, apiKey) {
  const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `KakaoAK ${apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error('좌표 변환에 실패했습니다.')
    }

    const result = await response.json()

    if (result.documents.length === 0) {
      return { data: null, error: { message: '주소를 찾을 수 없습니다.' } }
    }

    const doc = result.documents[0]
    const addressData = {
      address: doc.address?.address_name || '',
      roadAddress: doc.road_address?.address_name || '',
      buildingName: doc.road_address?.building_name || '',
      zonecode: doc.road_address?.zone_no || ''
    }

    return { data: addressData, error: null }
  } catch (err) {
    console.error('Coord2Address failed:', err)
    return { data: null, error: err }
  }
}

// ========================================
// 공공 데이터 API (국토교통부 실거래가)
// ========================================

/**
 * 국토교통부 아파트 실거래가 조회
 * @param {string} serviceKey - 공공데이터포털 인증키
 * @param {string} lawdCd - 법정동코드 (5자리)
 * @param {string} dealYmd - 거래년월 (YYYYMM)
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function getApartmentRealPrice(serviceKey, lawdCd, dealYmd) {
  const url = `http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev`
  const params = new URLSearchParams({
    serviceKey: serviceKey,
    LAWD_CD: lawdCd,
    DEAL_YMD: dealYmd,
    numOfRows: '100',
    pageNo: '1'
  })

  try {
    const response = await fetch(`${url}?${params}`)

    if (!response.ok) {
      throw new Error('실거래가 조회에 실패했습니다.')
    }

    const text = await response.text()
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, 'text/xml')

    const items = xml.querySelectorAll('item')
    const transactions = Array.from(items).map(item => ({
      apartmentName: item.querySelector('아파트')?.textContent || '',
      area: parseFloat(item.querySelector('전용면적')?.textContent || '0'),
      floor: item.querySelector('층')?.textContent || '',
      dealAmount: item.querySelector('거래금액')?.textContent?.trim().replace(/,/g, '') || '0',
      buildYear: item.querySelector('건축년도')?.textContent || '',
      dealYear: item.querySelector('년')?.textContent || '',
      dealMonth: item.querySelector('월')?.textContent?.padStart(2, '0') || '',
      dealDay: item.querySelector('일')?.textContent?.padStart(2, '0') || '',
      dong: item.querySelector('법정동')?.textContent || '',
      jibun: item.querySelector('지번')?.textContent || ''
    }))

    return { data: transactions, error: null }
  } catch (err) {
    console.error('Real price API failed:', err)
    return { data: [], error: err }
  }
}

// ========================================
// 날씨 API (기상청 또는 OpenWeatherMap)
// ========================================

/**
 * OpenWeatherMap API로 날씨 정보 조회
 * @param {number} lat - 위도
 * @param {number} lon - 경도
 * @param {string} apiKey - OpenWeatherMap API 키
 * @returns {Promise<{data: any, error: any}>}
 */
export async function getWeather(lat, lon, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('날씨 정보 조회에 실패했습니다.')
    }

    const data = await response.json()

    const weatherData = {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0]?.description || '',
      icon: data.weather[0]?.icon || '',
      windSpeed: data.wind.speed,
      cityName: data.name
    }

    return { data: weatherData, error: null }
  } catch (err) {
    console.error('Weather API failed:', err)
    return { data: null, error: err }
  }
}

// ========================================
// Mock API for Development
// ========================================

/**
 * 개발용 모의 API 호출 (실제 API 없을 때 사용)
 * @param {string} endpoint - API 엔드포인트 이름
 * @param {object} params - 요청 파라미터
 * @returns {Promise<{data: any, error: any}>}
 */
export async function mockApiCall(endpoint, params = {}) {
  // 실제 API 호출 시뮬레이션 (500ms 지연)
  await new Promise(resolve => setTimeout(resolve, 500))

  // 엔드포인트별 모의 데이터
  const mockData = {
    'apartment-price': {
      apartmentName: '래미안아파트',
      averagePrice: 85000,
      priceChange: 3.5,
      transactions: 45
    },
    'regional-stats': {
      region: '강남구',
      averagePrice: 120000,
      priceChange: 5.2,
      supplyCount: 1234
    },
    'price-trend': {
      trend: 'up',
      changeRate: 4.5,
      prediction: 'stable'
    }
  }

  const data = mockData[endpoint] || { message: 'Mock data not found' }

  return { data, error: null }
}

// ========================================
// API Error Handler
// ========================================

/**
 * API 에러 처리 헬퍼
 * @param {Error} error - 에러 객체
 * @returns {string} 사용자 친화적 에러 메시지
 */
export function handleApiError(error) {
  if (error.message.includes('Failed to fetch')) {
    return '네트워크 연결을 확인해주세요.'
  }

  if (error.message.includes('401')) {
    return '인증에 실패했습니다. API 키를 확인해주세요.'
  }

  if (error.message.includes('403')) {
    return '접근 권한이 없습니다.'
  }

  if (error.message.includes('404')) {
    return '요청한 데이터를 찾을 수 없습니다.'
  }

  if (error.message.includes('500')) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }

  return error.message || '알 수 없는 오류가 발생했습니다.'
}
