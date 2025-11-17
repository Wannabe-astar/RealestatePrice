# 부동산 시세 분석 앱 (Real Estate Price Tracker)

중장년층을 위한 부동산 시세 분석 및 추적 애플리케이션

## 📋 프로젝트 소개

대한민국 부동산 시세를 분석하고 추적하는 중장년층 특화 앱입니다.
어르신들이 사용하기 편리하도록 직관적이고 큰 글씨 위주의 UI로 구성되었습니다.

### 주요 기능

- **내 부동산 관리**: 보유한 부동산 등록 및 관리 (CRUD)
- **시세 추이 조회**: 등록된 부동산의 시세 변동을 차트로 시각화
- **지역별 시세 비교**: 주요 지역별 부동산 시세 비교 분석
- **시세 알림**: 급변동 시 알림 설정 및 관리
- **관심 부동산 찜하기**: 구매 희망 부동산 추적

## 🛠 기술 스택

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn
- Supabase 계정

### 설치

1. 저장소 클론
```bash
git clone https://github.com/Wannabe-astar/RealestatePrice.git
cd RealestatePrice
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.example` 파일을 `.env`로 복사하고 Supabase 정보를 입력하세요:
```bash
cp .env.example .env
```

`.env` 파일 내용:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 개발 서버 실행
```bash
npm run dev
```

5. 브라우저에서 `http://localhost:3000` 접속

### 빌드

프로덕션 빌드:
```bash
npm run build
```

빌드 미리보기:
```bash
npm run preview
```

## 📦 프로젝트 구조

```
RealestatePrice/
├── src/
│   ├── components/      # 재사용 가능한 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   ├── contexts/       # React Context
│   ├── hooks/          # Custom Hooks
│   ├── lib/            # 라이브러리 설정
│   ├── App.jsx         # 메인 앱 컴포넌트
│   └── main.jsx        # 진입점
├── public/             # 정적 파일
└── .github/
    └── workflows/      # GitHub Actions CI/CD
```

## 🎨 디자인 시스템

중장년층 사용자를 위한 접근성 중심 디자인:
- 큰 글씨 (최소 16px)
- 명확한 색상 대비
- 넓은 터치 영역 (최소 48px)
- 직관적인 아이콘
- 반응형 레이아웃

## 🔒 데이터베이스 스키마

Supabase를 사용하며, 다음 테이블을 포함합니다:
- `profiles` - 사용자 프로필
- `user_properties` - 사용자 부동산
- `property_prices` - 시세 데이터
- `regional_statistics` - 지역별 통계
- `user_alerts` - 알림 설정
- `notifications` - 알림 내역
- `user_wishlist` - 찜 목록

## 🤝 기여

기여를 환영합니다! Pull Request를 보내주세요.

## 📝 라이선스

MIT License

## 📧 문의

이슈를 통해 문의해주세요.