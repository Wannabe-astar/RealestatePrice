import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { Home, TrendingUp, Map, Bell, Heart, LogOut, Menu, X } from 'lucide-react'

const Layout = ({ children }) => {
  const { user, signOut } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const menuItems = [
    { path: '/', icon: Home, label: '홈' },
    { path: '/properties', icon: TrendingUp, label: '내 부동산' },
    { path: '/regional', icon: Map, label: '지역 비교' },
    { path: '/alerts', icon: Bell, label: '알림' },
    { path: '/wishlist', icon: Heart, label: '찜하기' }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
              부동산 시세 분석
            </h1>

            {user && (
              <div className="flex items-center gap-4">
                <span className="hidden sm:block text-base text-text-secondary">
                  {user.email}
                </span>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden p-2 text-text-secondary"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-base text-text-secondary hover:text-text-primary transition-colors"
                >
                  <LogOut size={20} />
                  <span>로그아웃</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="sm:hidden border-t border-border bg-white">
            <div className="px-4 py-2">
              <p className="text-sm text-text-secondary mb-2">{user.email}</p>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-base text-text-secondary hover:text-text-primary"
              >
                <LogOut size={20} />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Navigation */}
      {user && (
        <nav className="bg-white border-b border-border sticky top-[73px] z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-3 text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                      active
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
