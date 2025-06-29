-- 댓글 테이블 생성 (대댓글 지원)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL, -- 게시글 ID (posts 테이블과 연결)
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- 대댓글용 부모 댓글 ID
    nickname TEXT NOT NULL,
    password TEXT NOT NULL, -- 댓글 수정/삭제용 비밀번호
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE, -- 삭제 표시 (실제 삭제 대신 플래그)
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 게시글 테이블 생성 (댓글과 연결용)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    nickname TEXT NOT NULL,
    password TEXT NOT NULL, -- 게시글 수정/삭제용 비밀번호
    category TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- RLS 정책 설정
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 댓글 정책: 모든 사용자가 댓글을 읽을 수 있음
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (is_deleted = FALSE);

-- 댓글 정책: 모든 사용자가 댓글을 작성할 수 있음
CREATE POLICY "Anyone can insert comments" ON public.comments
    FOR INSERT WITH CHECK (true);

-- 댓글 정책: 모든 사용자가 댓글을 수정할 수 있음 (비밀번호 검증은 앱에서 처리)
CREATE POLICY "Anyone can update comments" ON public.comments
    FOR UPDATE USING (true);

-- 게시글 정책: 모든 사용자가 게시글을 읽을 수 있음
CREATE POLICY "Anyone can view posts" ON public.posts
    FOR SELECT USING (is_deleted = FALSE);

-- 게시글 정책: 모든 사용자가 게시글을 작성할 수 있음
CREATE POLICY "Anyone can insert posts" ON public.posts
    FOR INSERT WITH CHECK (true);

-- 게시글 정책: 모든 사용자가 게시글을 수정할 수 있음
CREATE POLICY "Anyone can update posts" ON public.posts
    FOR UPDATE USING (true);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON public.comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON public.posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 