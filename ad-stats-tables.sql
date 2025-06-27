-- 1. 광고 노출 기록 테이블
CREATE TABLE ad_impressions (
  id BIGSERIAL PRIMARY KEY,
  ad_id BIGINT REFERENCES ads(id) ON DELETE CASCADE,
  user_ip TEXT,
  user_agent TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 광고 클릭 기록 테이블
CREATE TABLE ad_clicks (
  id BIGSERIAL PRIMARY KEY,
  ad_id BIGINT REFERENCES ads(id) ON DELETE CASCADE,
  impression_id BIGINT REFERENCES ad_impressions(id) ON DELETE CASCADE,
  user_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 일일 통계 집계 테이블
CREATE TABLE ad_stats_daily (
  id BIGSERIAL PRIMARY KEY,
  ad_id BIGINT REFERENCES ads(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ad_id, date)
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_ad_impressions_ad_id ON ad_impressions(ad_id);
CREATE INDEX idx_ad_impressions_created_at ON ad_impressions(created_at);
CREATE INDEX idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX idx_ad_clicks_created_at ON ad_clicks(created_at);
CREATE INDEX idx_ad_stats_daily_ad_id ON ad_stats_daily(ad_id);
CREATE INDEX idx_ad_stats_daily_date ON ad_stats_daily(date);

-- RLS 정책 설정
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_stats_daily ENABLE ROW LEVEL SECURITY;

-- 광고주는 자신의 광고 통계만 볼 수 있음
CREATE POLICY "광고주는 자신의 광고 통계만 조회" ON ad_stats_daily
  FOR SELECT USING (
    ad_id IN (
      SELECT id FROM ads WHERE advertiser_id = auth.uid()
    )
  );

-- 관리자는 모든 통계 조회 가능
CREATE POLICY "관리자는 모든 통계 조회" ON ad_stats_daily
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ); 