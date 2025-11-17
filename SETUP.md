# Supabase 설정

## ⚠️ 중요: 환경 변수 설정이 필요합니다

이 앱을 실행하려면 Supabase 프로젝트 설정이 필요합니다.

### 1단계: .env 파일 생성

프로젝트 루트에 `.env` 파일을 생성하세요:

```bash
cp .env.example .env
```

### 2단계: Supabase 프로젝트 정보 입력

`.env` 파일을 열고 다음 정보를 입력하세요:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase 정보 찾기

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. Settings → API 메뉴 이동
4. 다음 정보 복사:
   - **Project URL**: `VITE_SUPABASE_URL`에 입력
   - **anon public key**: `VITE_SUPABASE_ANON_KEY`에 입력

### 3단계: 데이터베이스 스키마 설정

1. Supabase 대시보드에서 SQL Editor 열기
2. `supabase-schema.sql` 파일의 내용 복사
3. SQL Editor에 붙여넣고 실행

### 4단계: 개발 서버 재시작

환경 변수를 변경한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 기존 서버 종료 (Ctrl + C)
# 다시 시작
npm run dev
```

### 문제 해결

#### 로그인이 안 될 때

1. **환경 변수 확인**
   - 브라우저 콘솔(F12)을 열어 Supabase 설정 확인
   - "placeholder" 경고가 있다면 .env 파일을 확인하세요

2. **Supabase Auth 설정**
   - Supabase 대시보드 → Authentication → Settings
   - "Enable Email Confirmations" 확인
   - 이메일 인증이 필요한 경우 인증 링크를 클릭하세요

3. **사용자 직접 추가한 경우**
   - Supabase 대시보드에서 사용자를 추가했다면
   - 비밀번호를 재설정하거나
   - 회원가입 페이지에서 다시 가입하세요

4. **데이터베이스 스키마**
   - `supabase-schema.sql`이 실행되었는지 확인
   - RLS 정책이 올바르게 설정되었는지 확인

### 테스트 계정 생성

개발 중에는 회원가입 페이지에서 새 계정을 생성하세요:

```
이메일: test@example.com
비밀번호: password123
```

## 체크리스트

- [ ] `.env` 파일 생성됨
- [ ] `VITE_SUPABASE_URL` 설정됨
- [ ] `VITE_SUPABASE_ANON_KEY` 설정됨
- [ ] `supabase-schema.sql` 실행됨
- [ ] 개발 서버 재시작됨
- [ ] 브라우저 콘솔에서 환경 변수 확인됨
