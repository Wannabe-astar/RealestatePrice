// ========================================
// Mock Service - MVP 개발용 목 데이터 서비스
// ========================================

// 목 데이터 저장소
let mockDatabase = {
  properties: [],
  alerts: [],
  wishlist: [],
  priceHistory: [],
  regionalData: []
}

// ID 생성 헬퍼
let idCounter = 1
export function generateMockId() {
  return `mock_${Date.now()}_${idCounter++}`
}

// 지연 시뮬레이션 (실제 API 호출처럼)
export function delay(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ========================================
// Generic CRUD Operations
// ========================================

export async function mockCreate(entity, data) {
  await delay()

  const newItem = {
    id: generateMockId(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (!mockDatabase[entity]) {
    mockDatabase[entity] = []
  }

  mockDatabase[entity].push(newItem)
  return { data: newItem, error: null }
}

export async function mockRead(entity, id) {
  await delay()

  if (!mockDatabase[entity]) {
    return { data: null, error: { message: 'Entity not found' } }
  }

  const item = mockDatabase[entity].find(item => item.id === id)

  if (!item) {
    return { data: null, error: { message: 'Item not found' } }
  }

  return { data: item, error: null }
}

export async function mockReadList(entity, filters = {}) {
  await delay()

  if (!mockDatabase[entity]) {
    return { data: [], error: null }
  }

  let items = [...mockDatabase[entity]]

  // 필터링
  if (filters.user_id) {
    items = items.filter(item => item.user_id === filters.user_id)
  }

  // 정렬
  if (filters.orderBy) {
    items.sort((a, b) => {
      const aVal = a[filters.orderBy]
      const bVal = b[filters.orderBy]
      return filters.ascending ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })
  }

  return { data: items, error: null }
}

export async function mockUpdate(entity, id, updates) {
  await delay()

  if (!mockDatabase[entity]) {
    return { data: null, error: { message: 'Entity not found' } }
  }

  const index = mockDatabase[entity].findIndex(item => item.id === id)

  if (index === -1) {
    return { data: null, error: { message: 'Item not found' } }
  }

  mockDatabase[entity][index] = {
    ...mockDatabase[entity][index],
    ...updates,
    updated_at: new Date().toISOString()
  }

  return { data: mockDatabase[entity][index], error: null }
}

export async function mockDelete(entity, id) {
  await delay()

  if (!mockDatabase[entity]) {
    return { data: null, error: { message: 'Entity not found' } }
  }

  const index = mockDatabase[entity].findIndex(item => item.id === id)

  if (index === -1) {
    return { data: null, error: { message: 'Item not found' } }
  }

  const deletedItem = mockDatabase[entity][index]
  mockDatabase[entity].splice(index, 1)

  return { data: deletedItem, error: null }
}

// ========================================
// Domain-Specific Mock Services
// ========================================

// 부동산 시세 분석 목 데이터
export async function mockPropertyAnalysis(propertyId) {
  await delay(800)

  const basePrice = 50000 + Math.random() * 50000 // 5억~10억
  const monthlyData = []

  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)

    const variance = (Math.random() - 0.5) * 5000 // ±5천만원 변동
    const price = Math.round(basePrice + variance)

    monthlyData.push({
      date: date.toISOString().split('T')[0],
      price: price,
      month: date.toISOString().slice(0, 7)
    })
  }

  return {
    data: {
      property_id: propertyId,
      price_history: monthlyData,
      current_price: monthlyData[monthlyData.length - 1].price,
      average_price: Math.round(monthlyData.reduce((sum, d) => sum + d.price, 0) / monthlyData.length),
      min_price: Math.min(...monthlyData.map(d => d.price)),
      max_price: Math.max(...monthlyData.map(d => d.price)),
      trend: monthlyData[11].price > monthlyData[0].price ? 'up' : 'down'
    },
    error: null
  }
}

// 지역 비교 목 데이터
export async function mockRegionalComparison() {
  await delay(600)

  const regions = [
    { name: '서울', code: 'seoul' },
    { name: '경기', code: 'gyeonggi' },
    { name: '인천', code: 'incheon' },
    { name: '부산', code: 'busan' },
    { name: '대구', code: 'daegu' },
    { name: '광주', code: 'gwangju' },
    { name: '대전', code: 'daejeon' },
    { name: '울산', code: 'ulsan' }
  ]

  const data = regions.map(region => ({
    region: region.name,
    region_code: region.code,
    average_price: Math.round(30000 + Math.random() * 70000), // 3억~10억
    price_change: (Math.random() - 0.4) * 10, // -4% ~ +6%
    transaction_count: Math.round(100 + Math.random() * 500),
    supply_count: Math.round(50 + Math.random() * 200)
  }))

  return { data, error: null }
}

// 관심 지역 가격 알림 목 데이터
export async function mockPriceAlerts(userId) {
  await delay()

  const alerts = [
    {
      id: generateMockId(),
      user_id: userId,
      property_id: 'mock_prop_1',
      property_name: '강남구 대치동 래미안',
      alert_type: 'price_increase',
      threshold: 5,
      current_value: 7.2,
      is_active: true,
      triggered_at: new Date(Date.now() - 86400000).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    {
      id: generateMockId(),
      user_id: userId,
      property_id: 'mock_prop_2',
      property_name: '서초구 반포동 아크로리버파크',
      alert_type: 'price_decrease',
      threshold: 3,
      current_value: 1.5,
      is_active: true,
      triggered_at: null,
      created_at: new Date(Date.now() - 86400000 * 15).toISOString()
    }
  ]

  return { data: alerts, error: null }
}

// 초기 샘플 데이터 생성
export function initializeMockData(userId) {
  mockDatabase.properties = [
    {
      id: 'mock_prop_1',
      user_id: userId,
      address: '서울특별시 강남구 대치동 123-45',
      area: 84.5,
      property_type: 'apartment',
      purchase_price: 85000,
      purchase_date: '2020-03-15',
      created_at: new Date(Date.now() - 86400000 * 365).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 365).toISOString()
    },
    {
      id: 'mock_prop_2',
      user_id: userId,
      address: '서울특별시 서초구 반포동 678-90',
      area: 114.2,
      property_type: 'apartment',
      purchase_price: 120000,
      purchase_date: '2019-07-22',
      created_at: new Date(Date.now() - 86400000 * 500).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 500).toISOString()
    }
  ]

  mockDatabase.wishlist = [
    {
      id: 'mock_wish_1',
      user_id: userId,
      address: '서울특별시 송파구 잠실동 올림픽선수촌아파트',
      property_type: 'apartment',
      target_price: 95000,
      current_price: 102000,
      created_at: new Date(Date.now() - 86400000 * 60).toISOString()
    }
  ]
}

// 목 데이터베이스 초기화
export function clearMockDatabase() {
  mockDatabase = {
    properties: [],
    alerts: [],
    wishlist: [],
    priceHistory: [],
    regionalData: []
  }
}

// 목 데이터베이스 전체 조회 (디버깅용)
export function getMockDatabase() {
  return mockDatabase
}
