'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import AdSlot from '@/components/AdSlot';

// 구글 애드센스 타입 정의
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.id;
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState({
    left: [],
    right: [],
    sidebar: null
  });
  const [relatedPosts, setRelatedPosts] = useState([]);

  // 샘플 데이터
  const samplePost = {
    id: postId,
    title: '개인회생 신청 후 생활비는 어떻게 관리하나요?',
    content: `개인회생을 신청한 후 생활비 관리에 대해 궁금한 점이 많습니다.

현재 월 소득이 300만원 정도이고, 부채가 1억 정도 됩니다. 개인회생을 신청하면 생활비는 어떻게 책정되나요?

또한 회생계획 기간 동안 추가 대출이나 신용카드 사용이 가능한지도 궁금합니다.

경험 있으신 분들의 조언 부탁드립니다.`,
    nickname: '고민중인사람',
    created_at: '2024-01-15',
    view_count: 156,
    comment_count: 8,
    category: '개인회생'
  };

  const popularPosts = [
    { id: 1, title: '개인회생 vs 개인파산 차이점', nickname: '전문가', view_count: 234, comment_count: 12 },
    { id: 2, title: '신용회복위원회 워크아웃 후기', nickname: '경험담', view_count: 189, comment_count: 8 },
    { id: 3, title: '법무사 비용 얼마나 드나요?', nickname: '질문자', view_count: 167, comment_count: 15 },
    { id: 4, title: '회생계획 인가 후 주의사항', nickname: '조언자', view_count: 145, comment_count: 6 },
    { id: 5, title: '면책 결정까지 기간은?', nickname: '궁금이', view_count: 123, comment_count: 9 }
  ];

  const sampleComments = [
    {
      id: 1,
      nickname: '경험자1',
      content: '저도 비슷한 상황이었는데, 생활비는 법원에서 최저생계비 기준으로 정해줍니다. 가족 수에 따라 다르니 법무사와 상담받아보세요.',
      created_at: '2024-01-16',
    },
    {
      id: 2,
      nickname: '법무사김',
      content: '개인회생 기간 중에는 신용카드 사용이 제한됩니다. 하지만 생활에 필요한 최소한의 금액은 사용 가능해요.',
      created_at: '2024-01-16',
    }
  ];

  // 구글 애드센스 배너 컴포넌트
  function AdsenseBanner({ position = 'horizontal' }) {
    const isDev = process.env.NODE_ENV === 'development';
    const adRef = useRef(null);
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
      if (isDev) return; // 개발 환경에서는 실행하지 않음
      
      const loadAd = () => {
        try {
          if (typeof window !== 'undefined' && window.adsbygoogle && adRef.current) {
            const adElement = adRef.current.querySelector('.adsbygoogle:not([data-adsbygoogle-status])');
            if (adElement) {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          }
        } catch (error) {
          console.error('AdSense 로딩 에러:', error);
        }
      };

      const checkAd = () => {
        if (adRef.current) {
          const hasIframe = adRef.current.querySelector('iframe');
          setAdLoaded(!!hasIframe);
        }
      };

      // 짧은 지연 후 광고 로드 시도
      const timer = setTimeout(loadAd, 100);
      const interval = setInterval(checkAd, 500);
      
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }, [isDev]);

    // 개발 환경에서는 플레이스홀더만 표시
    if (isDev) {
      return (
        <div className="w-full flex items-center justify-center" style={{ 
          position: 'relative', 
          height: position === 'horizontal' ? '180px' : '200px',
          minHeight: position === 'horizontal' ? '180px' : '200px' 
        }}>
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-lg font-bold mb-2">📢</div>
            <div className="text-sm font-medium mb-1">구글 애드센스 광고</div>
            <div className="text-xs opacity-75">{position === 'horizontal' ? '가로형 180px' : '정사각형 200px'} 배너</div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full flex items-center justify-center" style={{ 
        position: 'relative', 
        height: position === 'horizontal' ? '180px' : '200px',
        minHeight: position === 'horizontal' ? '180px' : '200px' 
      }}>
        {/* 광고 더미 (광고가 없을 때만 보임) */}
        {!adLoaded && (
          <div
            style={{
              position: 'absolute',
              left: 0, top: 0, right: 0, bottom: 0,
              background: '#f3f4f6',
              color: '#888',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              zIndex: 1
            }}
          >
            구글 애드센스 광고 준비중...
          </div>
        )}
        {/* 구글 애드센스 광고 */}
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ 
            display: 'block', 
            width: '100%', 
            height: position === 'horizontal' ? '180px' : '200px',
            minHeight: position === 'horizontal' ? '180px' : '200px'
          }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="YOUR_SLOT_ID"
          data-ad-format={position === 'horizontal' ? 'horizontal' : 'rectangle'}
          data-full-width-responsive="false"
        />
      </div>
    );
  }

  useEffect(() => {
    // 데이터 로딩 시뮬레이션
    setPost(samplePost);
    setComments(sampleComments);
    fetchAds();
    fetchRelatedPosts();
    setLoading(false);
  }, [postId]);



  // 관련 게시글 가져오기
  const fetchRelatedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .neq('id', postId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setRelatedPosts(data);
      } else {
        // 샘플 게시글 데이터 사용
        setRelatedPosts([
          { id: 101, title: '개인회생 vs 개인파산 차이점이 궁금해요', nickname: '질문자', category: '개인회생', created_at: '2024-01-20', view_count: 234, comment_count: 12, isNotice: false },
          { id: 102, title: '신용회복위원회 워크아웃 신청 후기', nickname: '경험담', category: '워크아웃', created_at: '2024-01-19', view_count: 189, comment_count: 8, isNotice: false },
          { id: 103, title: '법무사 비용 얼마나 드나요?', nickname: '준비중', category: '법무사상담', created_at: '2024-01-19', view_count: 167, comment_count: 15, isNotice: false },
          { id: 104, title: '회생계획 인가 후 주의사항들', nickname: '조언자', category: '회생절차', created_at: '2024-01-18', view_count: 145, comment_count: 6, isNotice: false },
          { id: 105, title: '면책 결정까지 기간은 보통 얼마나?', nickname: '궁금이', category: '개인파산', created_at: '2024-01-18', view_count: 123, comment_count: 9, isNotice: false },
          { id: 106, title: '신용점수 회복 방법 공유합니다', nickname: '회복중', category: '신용점수', created_at: '2024-01-17', view_count: 201, comment_count: 18, isNotice: false },
          { id: 107, title: '대출 정리하고 개인회생 신청했어요', nickname: '새출발', category: '대출관련', created_at: '2024-01-17', view_count: 178, comment_count: 11, isNotice: false },
          { id: 108, title: '변호사 vs 법무사 어떤 차이가?', nickname: '고민남', category: '변호사상담', created_at: '2024-01-16', view_count: 156, comment_count: 7, isNotice: false }
        ]);
      }
    } catch (error) {
      console.error('관련 게시글 가져오기 실패:', error);
      setRelatedPosts([]);
    }
  };

  // 광고 데이터 가져오기
  const fetchAds = async () => {
    try {
      const { data: adsData, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active');

      if (!error && adsData) {
        // 광고를 위치별로 분류
        const leftAds = adsData.filter(ad => ad.position === 'left').slice(0, 3);
        const rightAds = adsData.filter(ad => ad.position === 'right').slice(0, 3);
        const sidebarAd = adsData.find(ad => ad.position === 'sidebar');

        setAds({
          left: leftAds,
          right: rightAds,
          sidebar: sidebarAd
        });
      } else {
        // 샘플 광고 데이터 사용
        setAds({
          left: [
            { id: 1, title: '강남법무사 무료상담', image_url: '/001.jpg', website: 'https://example.com' },
            { id: 2, title: '개인회생 전문', image_url: '/001.jpg', website: 'https://example.com' },
            { id: 3, title: '24시간 상담가능', image_url: '/001.jpg', website: 'https://example.com' }
          ],
          right: [
            { id: 7, title: '우측 광고 1', image_url: '/001.jpg', website: 'https://example.com' },
            { id: 8, title: '우측 광고 2', image_url: '/001.jpg', website: 'https://example.com' },
            { id: 9, title: '우측 광고 3', image_url: '/001.jpg', website: 'https://example.com' }
          ],
          sidebar: { id: 6, title: '우측 메인 광고', image_url: '/001.jpg', website: 'https://example.com' }
        });
      }
    } catch (error) {
      console.error('광고 데이터 가져오기 실패:', error);
      // 기본 샘플 데이터 사용
      setAds({
        left: [
          { id: 1, title: '강남법무사 무료상담', image_url: '/001.jpg', website: 'https://example.com' },
          { id: 2, title: '개인회생 전문', image_url: '/001.jpg', website: 'https://example.com' },
          { id: 3, title: '24시간 상담가능', image_url: '/001.jpg', website: 'https://example.com' }
        ],
        right: [
          { id: 7, title: '우측 광고 1', image_url: '/001.jpg', website: 'https://example.com' },
          { id: 8, title: '우측 광고 2', image_url: '/001.jpg', website: 'https://example.com' },
          { id: 9, title: '우측 광고 3', image_url: '/001.jpg', website: 'https://example.com' }
        ],
        sidebar: { id: 6, title: '우측 메인 광고', image_url: '/001.jpg', website: 'https://example.com' }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="bg-gray-800 shadow-lg h-20">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="text-white flex items-center gap-3">
            <div className="text-2xl">🌟</div>
            <div>
              <div className="text-lg font-bold">힘내톡톡</div>
              <div className="text-xs text-gray-300">💡 신용회복, 개인회생, 재도전 정보 공유</div>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link href="/qa" className="text-white/80 hover:text-white text-sm transition-colors">
              Q&A
            </Link>
            <Link href="/news" className="text-white/80 hover:text-white text-sm transition-colors">
              뉴스
            </Link>
            <Link href="/rules" className="text-white/80 hover:text-white text-sm transition-colors">
              이용수칙
            </Link>
          </nav>
        </div>
      </header>

      {/* 상단 구글 애드센스 광고 (글내용 너비와 동일) */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-2"></div>
            <div className="col-span-7">
              <AdsenseBanner position="horizontal" />
            </div>
            <div className="col-span-3"></div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          
                     {/* 좌측 광고 3개 */}
           <div className="col-span-2">
             <div className="sticky top-6 space-y-4">
               {ads.left.map((ad, index) => (
                 <AdSlot 
                   key={ad.id || index}
                   position="sidebar" 
                   ad={ad}
                   className="w-full"
                   style={{ height: '180px' }}
                 />
               ))}
               {/* 부족한 광고 슬롯을 채우기 위한 기본 광고 */}
               {Array.from({ length: Math.max(0, 3 - ads.left.length) }).map((_, index) => (
                 <AdSlot 
                   key={`empty-left-${index}`}
                   position="sidebar" 
                   className="w-full"
                   style={{ height: '180px' }}
                 />
               ))}
             </div>
           </div>

          {/* 중앙 컨텐츠 */}
          <div className="col-span-7">
            {/* 게시글 내용 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                {/* 게시글 헤더 */}
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>조회 {post.view_count}</span>
                      <span>댓글 {post.comment_count}</span>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">{post.nickname}</span>
                    <span className="mx-2">•</span>
                    <span>{post.created_at}</span>
                  </div>
                </div>

                {/* 게시글 본문 */}
                <div className="prose max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </div>
                </div>

                {/* 게시글 하단 */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <span>👍</span>
                      <span>도움됨</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <span>💪</span>
                      <span>힘내세요</span>
                    </button>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700">
                    <span>공유</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 댓글 섹션 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  댓글 {comments.length}개
                </h3>

                {/* 댓글 작성 폼 */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex space-x-3 mb-3">
                    <input
                      type="text"
                      placeholder="닉네임"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
                    />
                    <input
                      type="password"
                      placeholder="비밀번호"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
                    />
                  </div>
                  <textarea
                    placeholder="댓글을 입력해주세요..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none mb-3"
                  />
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      댓글 작성
                    </button>
                  </div>
                </div>

                {/* 댓글 목록 */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-700">{comment.nickname}</span>
                          <span className="text-xs text-gray-500">{comment.created_at}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-xs text-gray-500 hover:text-gray-700">답글</button>
                          <button className="text-xs text-gray-500 hover:text-gray-700">수정</button>
                          <button className="text-xs text-gray-500 hover:text-gray-700">삭제</button>
                        </div>
                      </div>
                      <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 하단 구글 애드센스 광고 (댓글 바로 아래) */}
            <div className="mt-4">
              <AdsenseBanner position="horizontal" />
            </div>

            {/* 관련 게시글 리스트 */}
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* 헤더 */}
                <div className="bg-gray-800 px-4 py-3">
                  <h2 className="text-lg font-bold text-white">💡 다른 글도 확인해보세요</h2>
                </div>
                
                {/* 테이블 헤더 */}
                <div className="relative bg-gray-50 px-4 py-2">
                  <div className="flex items-center">
                    <div className="w-16 text-center text-sm font-medium text-gray-600">번호</div>
                    <div className="w-20 text-center text-sm font-medium text-gray-600">분류</div>
                    <div className="flex-1 text-left text-sm font-medium text-gray-600">제목</div>
                    <div className="w-24 text-center text-sm font-medium text-gray-600">닉네임</div>
                    <div className="w-20 text-center text-sm font-medium text-gray-600">날짜</div>
                    <div className="w-16 text-center text-sm font-medium text-gray-600">조회</div>
                    <div className="w-16 text-center text-sm font-medium text-gray-600">댓글</div>
                  </div>
                </div>

                {/* 게시글 목록 */}
                {relatedPosts.map((post, idx) => (
                  <div key={post.id} className={`relative px-4 py-3 hover:bg-gray-100 transition-colors ${
                    idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}>
                    <div className="flex items-center">
                      <div className="w-16 text-center text-sm text-gray-500">{idx + 1}</div>
                      <div className="w-20 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                          {post.category}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <Link 
                          href={`/post/${post.id}`}
                          className="text-sm text-gray-900 hover:text-blue-600 font-medium"
                        >
                          {post.title}
                          {post.comment_count > 0 && (
                            <span className="text-xs text-blue-600 ml-1">
                              [{post.comment_count}]
                            </span>
                          )}
                        </Link>
                      </div>
                      <div className="w-24 text-center text-sm text-gray-600">{post.nickname}</div>
                      <div className="w-20 text-center text-sm text-gray-500">{post.created_at.slice(5, 10)}</div>
                      <div className="w-16 text-center text-sm text-gray-500">{post.view_count}</div>
                      <div className="w-16 text-center text-sm text-orange-600 font-medium">
                        {post.comment_count}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 더보기 버튼 */}
                <div className="bg-gray-50 px-4 py-3 text-center border-t">
                  <Link 
                    href="/"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    전체 게시글 보기 →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 영역 */}
          <div className="col-span-3">
            <div className="sticky top-6 space-y-6">
              {/* 실시간 인기글 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    실시간 인기글
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {popularPosts.map((post, index) => (
                      <div key={post.id} className="group cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <span className={`flex-shrink-0 w-5 h-5 rounded text-xs font-bold flex items-center justify-center ${
                            index < 3 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {post.title}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                              <span>{post.nickname}</span>
                              <span>•</span>
                              <span>조회 {post.view_count}</span>
                              <span>•</span>
                              <span>댓글 {post.comment_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

                             {/* 우측 광고 1개 (메인과 동일 크기) */}
               <div className="w-full flex items-center justify-center" style={{ aspectRatio: '1/1', position: 'relative', minHeight: '200px' }}>
                 <AdSlot 
                   position="sidebar" 
                   ad={ads.right[0] || ads.sidebar}
                   className="w-full h-full"
                 />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 