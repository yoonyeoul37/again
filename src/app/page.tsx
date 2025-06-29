'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import AdSlot from '@/components/AdSlot';

// 구글 애드센스 타입 정의
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 20;
  const [ad, setAd] = useState(null);

  // localStorage에서 힘내 수 가져오기 함수
  const getCheerCount = (postId) => {
    try {
      const cheersKey = `post_cheers_${postId}`;
      const savedCheers = parseInt(localStorage.getItem(cheersKey) || '0');
      return savedCheers;
    } catch (error) {
      console.error('힘내 수 로드 실패:', error);
      return 0;
    }
  };

  // 힘내 버튼 클릭 여부 확인 함수
  const hasUserCheered = (postId) => {
    try {
      const clickedKey = `post_cheered_${postId}`;
      return localStorage.getItem(clickedKey) === 'true';
    } catch (error) {
      console.error('힘내 클릭 여부 확인 실패:', error);
      return false;
    }
  };

  // 게시글 데이터 가져오기
  useEffect(() => {
    fetchPosts();
    
    // 페이지가 다시 보여질 때 게시글 새로고침
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('페이지가 다시 보여짐, 게시글 새로고침');
        fetchPosts();
      }
    };
    
    // 페이지 포커스 이벤트
    const handleFocus = () => {
      console.log('페이지 포커스 됨, 게시글 새로고침');
      fetchPosts();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // URL의 refresh 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh')) {
      console.log('🔄 새로고침 파라미터 감지, 게시글 다시 로드');
      fetchPosts();
      // URL에서 refresh 파라미터 제거
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    // 주기적으로 게시글 새로고침 (30초마다)
    const interval = setInterval(() => {
      if (!document.hidden) { // 페이지가 보이는 상태일 때만
        console.log('⏰ 주기적 게시글 새로고침');
        fetchPosts();
      }
    }, 30000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('📝 게시글 목록 가져오기 시작');
      
      // localStorage 정리 (손상된 데이터 제거)
      try {
        // 댓글 관련 localStorage 정리
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('comments_') || key.startsWith('post_')) {
            try {
              const data = localStorage.getItem(key);
              if (data) {
                JSON.parse(data); // 파싱 테스트
              }
            } catch (e) {
              console.log(`손상된 localStorage 키 제거: ${key}`);
              localStorage.removeItem(key);
            }
          }
        });
      } catch (e) {
        console.log('localStorage 정리 중 오류:', e);
      }
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('게시글 가져오기 실패:', error);
        console.log('샘플 데이터 사용');
        setPosts(samplePosts);
      } else {
        console.log(`✅ 게시글 ${data?.length || 0}개 로드됨`);
        if (data && data.length > 0) {
          console.log('📋 최신 게시글 3개:');
          data.slice(0, 3).forEach((post, idx) => {
            console.log(`  ${idx + 1}. [${post.created_at}] ${post.title} (ID: ${post.id})`);
          });
        }
        setPosts(data || []);
      }
    } catch (error) {
      console.error('게시글 가져오기 중 오류:', error);
      console.log('오류로 인한 샘플 데이터 사용');
      setPosts(samplePosts);
    } finally {
      setLoading(false);
    }
  };

  // 샘플 게시글 데이터 (백업용)
  const samplePosts = [
    {
      id: 1,
      title: '안녕하세요 처음 가입했어요!',
      nickname: '새내기',
      category: '자유',
      created_at: '2024-01-15',
      view_count: 45,
      comment_count: 3,
      isNotice: false
    },
    {
      id: 2,
      title: '이 사이트 정말 좋네요 ㅎㅎ',
      nickname: '만족이',
      category: '자유',
      created_at: '2024-01-15',
      view_count: 67,
      comment_count: 5,
      isNotice: false
    },
    {
      id: 3,
      title: '질문 있어요! 도와주세요',
      nickname: '궁금이',
      category: '질문',
      created_at: '2024-01-14',
      view_count: 89,
      comment_count: 8,
      isNotice: false
    },
    {
      id: 4,
      title: '[공지] 사이트 이용 규칙 안내',
      nickname: '관리자',
      category: '공지',
      created_at: '2024-01-10',
      view_count: 234,
      comment_count: 12,
      isNotice: true
    },
    {
      id: 5,
      title: '정보 공유합니다~',
      nickname: '정보왕',
      category: '정보',
      created_at: '2024-01-14',
      view_count: 123,
      comment_count: 7,
      isNotice: false
    }
  ];

  // 카테고리 목록
  const categories = [
    '전체', '개인회생', '개인파산', '법인회생', '법인파산', '워크아웃', '신용회복위원', 
    '대출관련', '신용카드', '신용점수', '회생절차', '상환계획', '법무사상담', 
    '변호사상담', '회생비용', '파산비용', '인가결정', '셀프신청', '개인신청', '취업관련'
  ];

  // 광고 데이터
  const ads = [
    { id: 1, title: '광고 1', description: '여기에 광고가 들어갑니다', color: 'from-blue-100 to-blue-200' },
    { id: 2, title: '광고 2', description: '클릭해주세요!', color: 'from-green-100 to-green-200' },
    { id: 3, title: '광고 3', description: '특가 상품!', color: 'from-purple-100 to-purple-200' },
    { id: 4, title: '광고 4', description: '할인 이벤트', color: 'from-orange-100 to-orange-200' }
  ];

  // 인기글
  const popularPosts = [
    { id: 1, title: '오늘 날씨 정말 좋네요!', nickname: '날씨맨', view_count: 156 },
    { id: 2, title: '맛집 추천해주세요', nickname: '먹방러', view_count: 134 },
    { id: 3, title: '취업 준비 어떻게 하세요?', nickname: '취준생', view_count: 98 },
    { id: 4, title: '영화 추천 받아요', nickname: '영화광', view_count: 87 },
    { id: 5, title: '운동 같이 하실 분?', nickname: '헬창', view_count: 76 }
  ];

  // 카테고리 필터링
  const filteredPosts = selectedCategory === '전체' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  // 공지글과 일반글 분리
  const noticePosts = filteredPosts.filter(post => post.isNotice);
  const normalPosts = filteredPosts.filter(post => !post.isNotice);

  // 페이징 계산
  const totalPages = Math.ceil(normalPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = normalPosts.slice(startIndex, endIndex);

  // 페이지 번호 배열 생성 (최대 10개씩 표시)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 끝 페이지가 조정되면 시작 페이지도 다시 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  // 카테고리 변경 시 첫 페이지로 이동
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // 광고 데이터 가져오기
  useEffect(() => {
    async function fetchAd() {
      const userRegion = 'seoul'; // 임시 하드코딩
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .or(`and(ad_type.eq.major,major_city.eq.${userRegion}),and(ad_type.eq.regional,regions.cs.{${userRegion}})`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) setAd(data);
      else setAd(null);
    }
    fetchAd();
  }, []);

  // 구글 애드센스 배너 컴포넌트
  function AdsenseBanner() {
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
        <div className="w-full flex items-center justify-center" style={{ aspectRatio: '1/1', position: 'relative', minHeight: '200px', height: '200px' }}>
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-lg font-bold mb-2">📢</div>
            <div className="text-sm font-medium mb-1">구글 애드센스 광고</div>
            <div className="text-xs opacity-75">정사각형 200px 배너</div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full flex items-center justify-center" style={{ aspectRatio: '1/1', position: 'relative', minHeight: '200px' }}>
        {/* 광고 더미 (광고가 없을 때만 보임) */}
        {!adLoaded && (
          <div
            style={{
              position: 'absolute',
              left: 0, top: 0, right: 0, bottom: 0,
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              color: '#9ca3af',
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
          style={{ display: 'block', width: '100%', height: '100%' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="YOUR_SLOT_ID"
          data-ad-format="rectangle"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // 로딩 중일 때 표시할 내용
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <header className="bg-gray-800 shadow-lg h-20">
          <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <Link href="/" className="text-white flex items-center gap-3" onClick={() => { setSelectedCategory('전체'); setCurrentPage(1); }}>
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
        
        {/* 로딩 메시지 */}
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">게시글을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
            {/* 통합 헤더 */}
      <header className="bg-gray-800 shadow-lg h-20">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="text-white flex items-center gap-3" onClick={() => { setSelectedCategory('전체'); setCurrentPage(1); }}>
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

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 왼쪽 메인 영역 */}
          <div className="flex-1">
            {/* 카테고리 버튼들 */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">게시판</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 글쓰기 버튼 */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => {
                  console.log('🔄 수동 새로고침 버튼 클릭');
                  setLoading(true);
                  fetchPosts();
                }}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                🔄 새로고침
              </button>
              <Link
                href="/board/write"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                글쓰기
              </Link>
            </div>

            {/* 게시글 목록 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* 헤더 */}
              <div className="relative bg-gray-50 px-4 py-2">
                <div className="flex items-center">
                  <div className="w-16 text-center text-sm font-medium text-gray-600">번호</div>
                  <div className="w-20 text-center text-sm font-medium text-gray-600">분류</div>
                  <div className="flex-1 text-left text-sm font-medium text-gray-600">제목</div>
                  <div className="w-24 text-center text-sm font-medium text-gray-600">닉네임</div>
                  <div className="w-20 text-center text-sm font-medium text-gray-600">날짜</div>
                  <div className="w-16 text-center text-sm font-medium text-gray-600">조회</div>
                  <div className="w-16 text-center text-sm font-medium text-gray-600">힘내</div>
                </div>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '0.5em',
                  backgroundImage: 'repeating-radial-gradient(circle, #333 0.5px, #333 1.5px, transparent 1.5px, transparent 4px)',
                  backgroundPosition: 'bottom',
                  backgroundSize: '4px 1.5px',
                  backgroundRepeat: 'repeat-x',
                  pointerEvents: 'none'
                }} />
              </div>

              {/* 공지글 */}
              {noticePosts.map((post, idx) => (
                <div key={post.id} className={`relative px-4 py-2 hover:bg-gray-100 transition-colors ${
                  idx % 2 === 0 ? 'bg-red-50' : 'bg-white'
                }`}>
                  <div className="flex items-center">
                    <div className="w-16 text-center text-sm text-red-600 font-bold">공지</div>
                    <div className="w-20 text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-medium">
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
                      {getCheerCount(post.id)}
                    </div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '0.5em',
                    backgroundImage: 'repeating-radial-gradient(circle, #333 0.5px, #333 1.5px, transparent 1.5px, transparent 4px)',
                    backgroundPosition: 'bottom',
                    backgroundSize: '4px 1.5px',
                    backgroundRepeat: 'repeat-x',
                    pointerEvents: 'none'
                  }} />
                </div>
              ))}

              {/* 일반글 */}
              {currentPosts.map((post, idx) => (
                <div key={post.id} className={`relative px-4 py-3 hover:bg-gray-100 transition-colors ${
                  (noticePosts.length + idx) % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}>
                  <div className="flex items-center">
                    <div className="w-16 text-center text-sm text-gray-500">{startIndex + idx + 1}</div>
                    <div className="w-20 text-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {post.category}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <Link 
                        href={`/post/${post.id}`}
                        className="text-sm text-gray-900 hover:text-blue-600"
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
                      {getCheerCount(post.id)}
                    </div>
                  </div>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: '0.5em',
                    backgroundImage: 'repeating-radial-gradient(circle, #333 0.5px, #333 1.5px, transparent 1.5px, transparent 4px)',
                    backgroundPosition: 'bottom',
                    backgroundSize: '4px 1.5px',
                    backgroundRepeat: 'repeat-x',
                    pointerEvents: 'none'
                  }} />
                </div>
              ))}
            </div>

            {/* 페이징 네비게이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                {/* 처음 페이지 */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  처음
                </button>

                {/* 이전 페이지 */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>

                {/* 페이지 번호들 */}
                {getPageNumbers().map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm border rounded transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* 다음 페이지 */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>

                {/* 마지막 페이지 */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  마지막
                </button>
              </div>
            )}

            {/* 페이지 정보 */}
            {totalPages > 1 && (
              <div className="text-center mt-4 text-sm text-gray-600">
                전체 {normalPosts.length}개 게시글 중 {startIndex + 1}~{Math.min(endIndex, normalPosts.length)}번째 (페이지 {currentPage}/{totalPages})
              </div>
            )}
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="w-80 space-y-6">
            {/* 우측 내부 광고 영역 */}
            <div className="w-full flex items-center justify-center" style={{ aspectRatio: '1/1', position: 'relative', minHeight: '200px' }}>
              <AdSlot position="sidebar" ad={ad} className="w-full h-full" />
            </div>

            {/* 인기글 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b">🔥 인기글</h3>
              <div className="space-y-2">
                {popularPosts.map((post, idx) => (
                  <div key={post.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      idx < 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/post/${post.id}`}
                        className="text-sm text-gray-900 hover:text-blue-600 truncate block"
                      >
                        {post.title}
                      </Link>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{post.nickname}</span>
                        <span>조회 {post.view_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 실시간 글 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-3 pb-2 border-b">⚡ 실시간</h3>
              <div className="space-y-2">
                {normalPosts.slice(0, 5).map(post => (
                  <div key={post.id} className="p-2 hover:bg-gray-50 rounded transition-colors">
                    <Link 
                      href={`/post/${post.id}`}
                      className="text-sm text-gray-900 hover:text-blue-600 block truncate"
                    >
                      {post.title}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                      {post.nickname} · {post.created_at.slice(5, 10)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 