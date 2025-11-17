import { BrowserRouter as Router } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <header className="bg-white shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              부동산 시세 분석 앱
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-text-primary mb-4">
              환영합니다!
            </h2>
            <p className="text-lg text-text-secondary">
              부동산 시세를 쉽게 확인하고 관리하세요.
            </p>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
