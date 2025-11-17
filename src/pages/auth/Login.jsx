import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card from '../../components/Card'

const Login = () => {
  const navigate = useNavigate()
  const { signIn } = useAuthContext()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await signIn(formData.email, formData.password)
      if (error) {
        console.error('Login error:', error)

        // 구체적인 에러 메시지 표시
        if (error.message.includes('Invalid login credentials')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('이메일 인증이 필요합니다. 이메일을 확인해주세요.')
        } else {
          setError(`로그인 실패: ${error.message}`)
        }
      } else {
        console.log('Login success:', data)
        navigate('/')
      }
    } catch (err) {
      console.error('Login exception:', err)
      setError('로그인 중 오류가 발생했습니다: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            부동산 시세 분석 앱
          </h1>
          <p className="text-lg text-text-secondary">
            로그인하여 시작하세요
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-base text-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="이메일"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
          />

          <Input
            label="비밀번호"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            required
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-base text-text-secondary">
            계정이 없으신가요?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Login
