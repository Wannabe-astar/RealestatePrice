import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// 환경 변수 확인 (개발 환경에서만)
if (import.meta.env.DEV) {
  console.log('Supabase Config:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey && supabaseAnonKey !== 'placeholder-key'
  })

  if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ VITE_SUPABASE_URL이 설정되지 않았습니다. .env 파일을 확인하세요.')
  }

  if (supabaseAnonKey === 'placeholder-key') {
    console.warn('⚠️ VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
