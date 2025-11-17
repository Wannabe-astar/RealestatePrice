import React from 'react'

const Loading = ({ message = '로딩 중...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-lg text-text-secondary">{message}</p>
    </div>
  )
}

export default Loading
