import React, { useState, useEffect } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import Card from '../components/Card'
import Loading from '../components/Loading'

const PriceTrends = () => {
  const { user } = useAuthContext()
  const [properties, setProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [priceData, setPriceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    currentPrice: 0,
    purchasePrice: 0,
    change: 0,
    changePercent: 0
  })

  useEffect(() => {
    if (user) {
      fetchProperties()
    }
  }, [user])

  useEffect(() => {
    if (selectedProperty) {
      fetchPriceData()
    }
  }, [selectedProperty])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProperties(data || [])
      if (data && data.length > 0) {
        setSelectedProperty(data[0])
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPriceData = async () => {
    try {
      const { data, error } = await supabase
        .from('property_prices')
        .select('*')
        .eq('property_id', selectedProperty.id)
        .order('price_date', { ascending: true })

      if (error) throw error

      // 데이터가 없으면 샘플 데이터 생성
      let priceHistory = data || []
      if (priceHistory.length === 0) {
        priceHistory = generateSamplePriceData(selectedProperty)
      }

      const formattedData = priceHistory.map(item => ({
        date: new Date(item.price_date).toLocaleDateString('ko-KR', { month: 'short', year: '2-digit' }),
        price: item.price,
        fullDate: item.price_date
      }))

      setPriceData(formattedData)

      // 통계 계산
      if (formattedData.length > 0) {
        const currentPrice = formattedData[formattedData.length - 1].price
        const purchasePrice = selectedProperty.purchase_price
        const change = currentPrice - purchasePrice
        const changePercent = ((change / purchasePrice) * 100).toFixed(2)

        setStats({
          currentPrice,
          purchasePrice,
          change,
          changePercent
        })
      }
    } catch (err) {
      console.error('Error fetching price data:', err)
    }
  }

  const generateSamplePriceData = (property) => {
    const data = []
    const basePrice = property.purchase_price
    const startDate = new Date(property.purchase_date)
    const today = new Date()

    // 매월 데이터 생성
    for (let d = new Date(startDate); d <= today; d.setMonth(d.getMonth() + 1)) {
      const monthsElapsed = (d.getFullYear() - startDate.getFullYear()) * 12 + (d.getMonth() - startDate.getMonth())
      // 약간의 변동성을 주되 전반적으로 상승 추세
      const variation = (Math.random() - 0.3) * 0.02 // -0.7% ~ 1.3%
      const trendIncrease = monthsElapsed * 0.003 // 월 0.3% 상승
      const price = Math.round(basePrice * (1 + trendIncrease + variation))

      data.push({
        price_date: new Date(d).toISOString().split('T')[0],
        price: price
      })
    }

    return data
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '만원'
  }

  if (loading) {
    return <Loading message="시세 데이터를 불러오는 중..." />
  }

  if (properties.length === 0) {
    return (
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
          시세 추이 조회
        </h2>
        <Card>
          <div className="text-center py-12">
            <TrendingUp size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              등록된 부동산이 없습니다
            </h3>
            <p className="text-base text-text-secondary">
              먼저 부동산을 등록해주세요
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
        시세 추이 조회
      </h2>
      <p className="text-lg text-text-secondary mb-6">
        등록된 부동산의 시세 변동을 확인하세요
      </p>

      {/* 부동산 선택 */}
      <div className="mb-6">
        <label className="block text-lg font-medium text-text-primary mb-2">
          부동산 선택
        </label>
        <select
          value={selectedProperty?.id || ''}
          onChange={(e) => {
            const property = properties.find(p => p.id === e.target.value)
            setSelectedProperty(property)
          }}
          className="input-large w-full max-w-md border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          {properties.map(property => (
            <option key={property.id} value={property.id}>
              {property.address}
            </option>
          ))}
        </select>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-sm text-text-secondary mb-1">구매가</p>
          <p className="text-xl font-bold text-text-primary">
            {formatPrice(stats.purchasePrice)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-text-secondary mb-1">현재 시세</p>
          <p className="text-xl font-bold text-text-primary">
            {formatPrice(stats.currentPrice)}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-text-secondary mb-1">변동액</p>
          <p className={`text-xl font-bold flex items-center gap-1 ${
            stats.change >= 0 ? 'text-success' : 'text-error'
          }`}>
            {stats.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            {formatPrice(Math.abs(stats.change))}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-text-secondary mb-1">수익률</p>
          <p className={`text-xl font-bold ${
            stats.changePercent >= 0 ? 'text-success' : 'text-error'
          }`}>
            {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent}%
          </p>
        </Card>
      </div>

      {/* 차트 */}
      <Card>
        <h3 className="text-xl font-semibold text-text-primary mb-4">
          시세 변동 그래프
        </h3>
        {priceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                style={{ fontSize: '14px' }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}억`}
                style={{ fontSize: '14px' }}
              />
              <Tooltip
                formatter={(value) => formatPrice(value)}
                labelStyle={{ fontSize: '14px' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563EB"
                strokeWidth={2}
                name="시세"
                dot={{ fill: '#2563EB', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <p className="text-base text-text-secondary">
              시세 데이터가 없습니다
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default PriceTrends
