import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import Loading from './Loading'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading message="로딩 중..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
