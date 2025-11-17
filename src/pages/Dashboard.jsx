import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Map, Bell, Heart, Plus } from 'lucide-react'
import Card from '../components/Card'

const Dashboard = () => {
  const features = [
    {
      icon: TrendingUp,
      title: '내 부동산 관리',
      description: '보유한 부동산을 등록하고 시세 변동을 확인하세요',
      link: '/properties',
      color: 'text-blue-600'
    },
    {
      icon: Map,
      title: '지역별 시세 비교',
      description: '주요 지역의 부동산 시세를 비교 분석하세요',
      link: '/regional',
      color: 'text-green-600'
    },
    {
      icon: Bell,
      title: '시세 알림',
      description: '급변동 시 알림을 받아보세요',
      link: '/alerts',
      color: 'text-orange-600'
    },
    {
      icon: Heart,
      title: '관심 부동산',
      description: '구매를 희망하는 부동산을 찜하고 추적하세요',
      link: '/wishlist',
      color: 'text-red-600'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          환영합니다!
        </h2>
        <p className="text-lg text-text-secondary">
          부동산 시세를 쉽게 확인하고 관리하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link key={feature.link} to={feature.link}>
              <Card variant="hover" className="h-full">
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} bg-opacity-10 p-3 rounded-lg`}>
                    <Icon size={32} className={feature.color} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-base text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-8">
        <Card>
          <div className="text-center py-8">
            <Plus size={48} className="mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              빠른 시작
            </h3>
            <p className="text-base text-text-secondary mb-4">
              첫 번째 부동산을 등록하고 시세 추적을 시작하세요
            </p>
            <Link
              to="/properties"
              className="inline-block bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              부동산 등록하기
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
