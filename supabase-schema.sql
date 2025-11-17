-- 사용자 프로필 테이블
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 보유 부동산 테이블
CREATE TABLE user_properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  address TEXT NOT NULL,
  area NUMERIC,
  purchase_price NUMERIC,
  purchase_date DATE,
  property_type TEXT DEFAULT 'apartment',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 부동산 시세 데이터 테이블
CREATE TABLE property_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES user_properties(id),
  price NUMERIC NOT NULL,
  price_date DATE NOT NULL,
  source TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 지역별 시장 데이터 테이블
CREATE TABLE market_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  avg_price NUMERIC NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 지역별 통계 테이블
CREATE TABLE regional_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region_name TEXT NOT NULL,
  avg_price NUMERIC NOT NULL,
  price_change NUMERIC,
  update_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 지역 테이블
CREATE TABLE regions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 알림 설정 테이블
CREATE TABLE user_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  alert_type TEXT NOT NULL,
  threshold NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 알림 기록 테이블
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- 관심 부동산 테이블
CREATE TABLE user_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  address TEXT NOT NULL,
  target_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- RLS 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;

-- profiles RLS 정책
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_properties RLS 정책
CREATE POLICY "Users can view own properties" ON user_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON user_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON user_properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON user_properties FOR DELETE USING (auth.uid() = user_id);

-- property_prices RLS 정책
CREATE POLICY "Users can view prices for own properties" ON property_prices FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_properties
    WHERE user_properties.id = property_prices.property_id
    AND user_properties.user_id = auth.uid()
  )
);

-- user_alerts RLS 정책
CREATE POLICY "Users can view own alerts" ON user_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON user_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON user_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alerts" ON user_alerts FOR DELETE USING (auth.uid() = user_id);

-- notifications RLS 정책
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- user_wishlist RLS 정책
CREATE POLICY "Users can view own wishlist" ON user_wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON user_wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wishlist" ON user_wishlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist" ON user_wishlist FOR DELETE USING (auth.uid() = user_id);

-- 기본 지역 데이터 삽입
INSERT INTO regions (name, code) VALUES
('서울특별시', 'SEOUL'),
('경기도', 'GYEONGGI'),
('인천광역시', 'INCHEON'),
('부산광역시', 'BUSAN'),
('대구광역시', 'DAEGU'),
('광주광역시', 'GWANGJU'),
('대전광역시', 'DAEJEON'),
('울산광역시', 'ULSAN');
