-- 개인광고 관리를 위한 custom_banners 테이블 생성
-- 상세페이지 좌측 3개 광고용

CREATE TABLE IF NOT EXISTS public.custom_banners (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    link TEXT,
    slot_number INTEGER NOT NULL CHECK (slot_number IN (1, 2, 3)),
    owner_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(slot_number) -- 각 슬롯은 하나의 광고만 가능
);

-- RLS 활성화
ALTER TABLE public.custom_banners ENABLE ROW LEVEL SECURITY;

-- 관리자만 개인광고를 관리할 수 있는 정책
CREATE POLICY "Admins can manage custom banners" ON public.custom_banners
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- 모든 사용자가 개인광고를 볼 수 있는 정책 (공개)
CREATE POLICY "Anyone can view custom banners" ON public.custom_banners
    FOR SELECT USING (true);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_custom_banners_slot_number ON public.custom_banners(slot_number);
CREATE INDEX IF NOT EXISTS idx_custom_banners_owner_email ON public.custom_banners(owner_email);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_custom_banners_updated_at 
    BEFORE UPDATE ON public.custom_banners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 스토리지 버킷 설정 (Supabase Dashboard에서 수동으로 설정)
-- Storage > New Bucket > Name: "banners" > Public bucket 체크
-- 또는 기존 ad-images 버킷 사용 가능

-- 샘플 데이터 (선택사항)
-- INSERT INTO public.custom_banners (image_url, link, slot_number, owner_email) 
-- VALUES 
--   ('/001.jpg', 'https://example.com', 1, 'admin@example.com'),
--   ('/001.jpg', 'https://example.com', 2, 'admin@example.com'),
--   ('/001.jpg', 'https://example.com', 3, 'admin@example.com')
-- ON CONFLICT (slot_number) DO NOTHING; 