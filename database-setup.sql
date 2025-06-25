-- Supabase 데이터베이스 설정 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. users 테이블 생성 (이미 존재할 수 있음)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK (role IN ('user', 'admin', 'advertiser')) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. advertisers 테이블 생성
CREATE TABLE IF NOT EXISTS public.advertisers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ads 테이블 생성
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advertiser_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    advertiser TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    ad_type TEXT CHECK (ad_type IN ('major', 'regional')) NOT NULL,
    major_city TEXT,
    regions TEXT[],
    image_url TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS (Row Level Security) 정책 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- 5. users 테이블 정책
-- 모든 사용자가 자신의 정보를 읽을 수 있음
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

-- 인증된 사용자가 자신의 정보를 업데이트할 수 있음
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- 인증된 사용자가 새 사용자를 생성할 수 있음 (회원가입용)
CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- 6. advertisers 테이블 정책
-- 광고주는 자신의 정보를 읽을 수 있음
CREATE POLICY "Advertisers can view own data" ON public.advertisers
    FOR SELECT USING (email = auth.jwt() ->> 'email');

-- 광고주는 자신의 정보를 업데이트할 수 있음
CREATE POLICY "Advertisers can update own data" ON public.advertisers
    FOR UPDATE USING (email = auth.jwt() ->> 'email');

-- 인증된 사용자가 광고주 정보를 생성할 수 있음 (회원가입용)
CREATE POLICY "Users can insert advertiser data" ON public.advertisers
    FOR INSERT WITH CHECK (email = auth.jwt() ->> 'email');

-- 관리자는 모든 광고주 정보를 볼 수 있음
CREATE POLICY "Admins can view all advertisers" ON public.advertisers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- 관리자는 광고주 상태를 업데이트할 수 있음
CREATE POLICY "Admins can update advertiser status" ON public.advertisers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- 7. ads 테이블 정책
-- 광고주는 자신의 광고를 볼 수 있음
CREATE POLICY "Advertisers can view own ads" ON public.ads
    FOR SELECT USING (advertiser_id = auth.uid());

-- 광고주는 자신의 광고를 생성할 수 있음
CREATE POLICY "Advertisers can insert own ads" ON public.ads
    FOR INSERT WITH CHECK (advertiser_id = auth.uid());

-- 광고주는 자신의 광고를 업데이트할 수 있음
CREATE POLICY "Advertisers can update own ads" ON public.ads
    FOR UPDATE USING (advertiser_id = auth.uid());

-- 관리자는 모든 광고를 볼 수 있음
CREATE POLICY "Admins can view all ads" ON public.ads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- 관리자는 광고 상태를 업데이트할 수 있음
CREATE POLICY "Admins can update ad status" ON public.ads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- 8. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_advertisers_email ON public.advertisers(email);
CREATE INDEX IF NOT EXISTS idx_advertisers_status ON public.advertisers(status);
CREATE INDEX IF NOT EXISTS idx_ads_advertiser_id ON public.ads(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_start_date ON public.ads(start_date);
CREATE INDEX IF NOT EXISTS idx_ads_end_date ON public.ads(end_date);

-- 9. 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. 트리거 생성
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisers_updated_at 
    BEFORE UPDATE ON public.advertisers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at 
    BEFORE UPDATE ON public.ads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. 기본 관리자 계정 생성 (선택사항)
-- INSERT INTO public.users (email, role) VALUES ('admin@example.com', 'admin')
-- ON CONFLICT (email) DO NOTHING;

-- 12. 스토리지 버킷 설정 (Supabase Dashboard에서 수동으로 설정해야 함)
-- Storage > New Bucket > Name: "ad-images" > Public bucket 체크
-- Storage > Policies > ad-images > New Policy > 다음 정책 추가:

-- 인증된 사용자가 이미지를 업로드할 수 있음
-- CREATE POLICY "Authenticated users can upload images" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'ad-images' AND auth.role() = 'authenticated');

-- 모든 사용자가 이미지를 볼 수 있음 (공개 버킷)
-- CREATE POLICY "Public can view images" ON storage.objects
--     FOR SELECT USING (bucket_id = 'ad-images');

-- 인증된 사용자가 자신이 업로드한 이미지를 삭제할 수 있음
-- CREATE POLICY "Users can delete own images" ON storage.objects
--     FOR DELETE USING (bucket_id = 'ad-images' AND auth.uid()::text = owner); 