import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import Button from '../../components/Button'
import Input from '../../components/Input'
import Card from '../../components/Card'

const Register = () => {
  const navigate = useNavigate()
  const { signUp } = useAuthContext()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [envWarning, setEnvWarning] = useState(false)

  useEffect(() => {
    // 환경 변수 확인
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' ||
        !supabaseKey || supabaseKey === 'placeholder-key') {
      setEnvWarning(true)
    }
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await signUp(formData.email, formData.password, formData.fullName)
      if (error) {
        console.error('Register error:', error)

        // 구체적인 에러 메시지 표시
        if (error.message.includes('already registered')) {
          setError('이미 가입된 이메일입니다.')
        } else if (error.message.includes('password')) {
          setError('비밀번호는 최소 6자 이상이어야 합니다.')
        } else {
          setError(`회원가입 실패: ${error.message}`)
        }
      } else {
        console.log('Register success:', data)
        alert('회원가입이 완료되었습니다. 로그인해주세요.')
        navigate('/login')
      }
    } catch (err) {
      console.error('Register exception:', err)
      setError('회원가입 중 오류가 발생했습니다: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            회원가입
          </h1>
          <p className="text-lg text-text-secondary">
            새 계정을 만드세요
          </p>
        </div>

        {envWarning && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              🔧 환경 설정이 필요합니다
            </h3>
            <p className="text-base text-yellow-700">
              Supabase 환경 변수가 설정되지 않았습니다.
              로그인 페이지를 확인하시거나 <code className="bg-yellow-100 px-1">SETUP.md</code>를 참고하세요.
            </p>
          </div>
        )}

        {error && !envWarning && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-base text-error">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="이름"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="홍길동"
            required
          />

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
            placeholder="최소 6자 이상"
            required
          />

          <Input
            label="비밀번호 확인"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호를 다시 입력하세요"
            required
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading || envWarning}
            className="w-full mt-2"
          >
            {envWarning ? '환경 설정 필요' : (loading ? '가입 중...' : '회원가입')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-base text-text-secondary">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default Register
