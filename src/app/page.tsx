'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import AdSlot from '@/components/AdSlot';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

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
  const postsPerPage = 15;
  const [ad, setAd] = useState(null);
  const [userLocation, setUserLocation] = useState<any>(null); // 사용자 위치 정보

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

  // 사용자 위치 정보 가져오기 (IP 기반)
  useEffect(() => {
    async function getUserLocation() {
      try {
        // 무료 IP 위치 서비스 사용
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const locationData = await response.json();
          console.log('🌍 사용자 위치 정보:', locationData);
          
                     // 한국 지역코드 매핑
           const regionMapping: { [key: string]: string | string[] } = {
             'Seoul': 'seoul',
             'Busan': 'busan', 
             'Daegu': 'daegu',
             'Incheon': 'incheon',
             'Daejeon': 'daejeon',
             'Gwangju': 'gwangju',
             'Ulsan': 'ulsan',
             'Sejong': 'sejong',
             // 경기도
             'Gyeonggi-do': ['suwon', 'seongnam', 'bucheon', 'ansan', 'anyang', 'pyeongtaek', 'goyang', 'yongin', 'hwaseong'],
             // 강원도  
             'Gangwon-do': ['chuncheon', 'wonju', 'gangneung', 'donghae'],
             // 충청북도
             'Chungcheongbuk-do': ['cheongju', 'chungju', 'jecheon'],
             // 충청남도
             'Chungcheongnam-do': ['cheonan', 'asan', 'seosan', 'nonsan'],
             // 전라북도
             'Jeollabuk-do': ['jeonju', 'iksan', 'gunsan', 'jeongeup'],
             // 전라남도
             'Jeollanam-do': ['mokpo', 'yeosu', 'suncheon', 'naju'],
             // 경상북도
             'Gyeongsangbuk-do': ['pohang', 'gumi', 'gyeongju', 'andong'],
             // 경상남도
             'Gyeongsangnam-do': ['changwon', 'jinju', 'tongyeong', 'sacheon'],
             // 제주도
             'Jeju-do': ['jeju_city', 'seogwipo']
           };

          let userRegion = null;
          
          // 시/도 정보로 사용자 지역 결정
          if (locationData.region) {
            const regionKey = Object.keys(regionMapping).find(key => 
              locationData.region.includes(key.replace('-do', '').replace('-', ''))
            );
            
            if (regionKey) {
              userRegion = regionMapping[regionKey];
              if (Array.isArray(userRegion)) {
                // 도 단위인 경우 첫 번째 주요 도시 선택
                userRegion = userRegion[0];
              }
            }
          }
          
          // 도시명으로도 확인
          if (!userRegion && locationData.city) {
            const cityName = locationData.city.toLowerCase();
            userRegion = Object.values(regionMapping).flat().find(region => 
              cityName.includes(region) || region.includes(cityName)
            );
          }

          setUserLocation({
            ...locationData,
            mappedRegion: userRegion || 'seoul' // 기본값은 서울
          });
          
          console.log(`📍 매핑된 사용자 지역: ${userRegion || 'seoul'}`);
          
        } else {
          console.log('❌ 위치 정보를 가져올 수 없습니다. 기본 지역(서울) 사용');
          setUserLocation({ mappedRegion: 'seoul' });
        }
      } catch (error) {
        console.error('위치 정보 가져오기 실패:', error);
        setUserLocation({ mappedRegion: 'seoul' }); // 기본값
      }
    }
    
    getUserLocation();
  }, []);

  // 광고 데이터 가져오기 (지역 기반 필터링)
  useEffect(() => {
    if (!userLocation) return; // 위치 정보가 없으면 대기
    
    async function fetchLocationBasedAd() {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active');
      
      if (!error && data && data.length > 0) {
        // 사용자 지역에 맞는 광고 필터링
        const filteredAds = data.filter(ad => {
          // 대도시 광고인 경우
          if (ad.ad_type === 'major' && ad.major_city === userLocation.mappedRegion) {
            return true;
          }
          
          // 지역 광고인 경우
          if (ad.ad_type === 'regional' && ad.regions && ad.regions.includes(userLocation.mappedRegion)) {
            return true;
          }
          
          return false;
        });
        
        console.log(`🎯 사용자 지역(${userLocation.mappedRegion})에 맞는 광고:`, filteredAds.length, '개');
        
        if (filteredAds.length > 0) {
          // 지역 맞춤 광고 중에서 랜덤 선택
          const randomIndex = Math.floor(Math.random() * filteredAds.length);
          setAd(filteredAds[randomIndex]);
          console.log(`🎲 지역 맞춤 광고 선택: ${randomIndex + 1}/${filteredAds.length} - ${filteredAds[randomIndex].title}`);
        } else {
          // 지역 맞춤 광고가 없으면 전체 광고 중에서 랜덤 선택 (폴백)
          const randomIndex = Math.floor(Math.random() * data.length);
          setAd(data[randomIndex]);
          console.log(`🎲 전체 광고에서 랜덤 선택 (폴백): ${randomIndex + 1}/${data.length} - ${data[randomIndex].title}`);
        }
      } else {
        setAd(null);
        console.log('❌ 활성 광고가 없습니다.');
      }
    }
    
    fetchLocationBasedAd();
    
    // 30초마다 광고 갱신 (지역 기반)
    const adInterval = setInterval(() => {
      fetchLocationBasedAd();
    }, 30000);
    
    return () => clearInterval(adInterval);
  }, [userLocation]); // userLocation이 변경될 때마다 실행

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
              <div className="text-2xl"></div>
              <div>
                <div className="text-2xl font-bold">개인회생119</div>
                <div className="text-xs text-gray-300">개인·법인회생파산 정보공유</div>
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
            <div className="text-2xl"></div>
            <div>
              <div className="text-2xl font-bold">개인회생119</div>
              <div className="text-xs text-gray-300">개인·법인회생파산 정보공유</div>
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
            {/* 카테고리 네비게이션 */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 overflow-hidden relative">
              {/* 배경 패턴 */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
                  backgroundSize: '60px 60px'
                }}></div>
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    카테고리
                  </h2>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {categories.map((category, index) => {
                    const isSelected = selectedCategory === category;
                    const colorClasses = {
                      '전체': isSelected 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 text-gray-700 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200',
                      '개인회생': isSelected 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 text-gray-700 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200',
                      '개인파산': isSelected 
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200',
                      '법인회생': isSelected 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-200',
                      '법인파산': isSelected 
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-lg shadow-orange-500/25' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 text-gray-700 hover:text-orange-600 border border-gray-200 hover:border-orange-200',
                      '질문답변': isSelected 
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 text-gray-700 hover:text-violet-600 border border-gray-200 hover:border-violet-200',
                      '정보공유': isSelected 
                        ? 'bg-gradient-to-r from-slate-600 to-gray-700 text-white shadow-lg shadow-slate-500/25' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 text-gray-700 hover:text-slate-600 border border-gray-200 hover:border-slate-200'
                    }[category] || (isSelected 
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-600 border border-gray-200');
                    
                    return (
                      <button
                        key={category}
                        onClick={() => handleCategoryChange(category)}
                        className={`group relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 ${colorClasses}`}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          {category === '전체' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                            </svg>
                          )}
                          {category.includes('개인') && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                          {category.includes('법인') && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          )}
                          {category === '질문답변' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                            </svg>
                          )}
                          {category === '정보공유' && (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          )}
                          {category}
                        </span>
                        
                        {/* 선택된 상태일 때 반짝이는 효과 */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse"></div>
                        )}
                        
                        {/* 호버 시 글로우 효과 */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    );
                  })}
                </div>
                
                {/* 선택된 카테고리 표시 */}
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>현재 보기: <span className="font-semibold text-gray-800">{selectedCategory}</span></span>
                </div>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => {
                  setLoading(true);
                  fetchPosts();
                }}
                className="group relative px-5 py-3 bg-gradient-to-r from-slate-100 to-gray-100 hover:from-slate-200 hover:to-gray-200 text-gray-700 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  새로고침
                </span>
                {/* 호버 시 글로우 효과 */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <Link
                href="/board/write"
                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                새 글 작성
              </Link>
            </div>

            {/* 게시글 목록 */}
            <div className="space-y-2">
              {/* 공지글 */}
              {noticePosts.map((post, idx) => (
                <div key={post.id} className="group relative">
                  <Link href={`/post/${post.id}`} className="block">
                    <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-l-4 border-gray-500 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                      {/* 공지 배지와 카테고리 */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            공지
                          </div>
                          <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium">
                            {post.category}
                          </span>
                        </div>
                        <div className="ml-auto text-xs text-gray-500 flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {post.created_at.slice(5, 10)}
                        </div>
                      </div>
                      
                      {/* 제목 */}
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-6 mb-4 px-3">
                        {post.title}
                      </h3>
                      
                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-sm text-gray-600 px-3">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {post.nickname}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            {post.view_count}
                          </span>
                          {post.comment_count > 0 && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <FontAwesomeIcon icon={faComment} className="w-3.5 h-3.5" />
                              {post.comment_count}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-orange-600 font-medium">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                          </svg>
                          {getCheerCount(post.id)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}

              {/* 일반글 */}
              {currentPosts.map((post, idx) => {
                const getCategoryIcon = (category) => {
                  if (category.includes('개인회생')) return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  );
                  if (category.includes('개인파산')) return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  );
                  if (category.includes('법인')) return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  );
                  if (category.includes('질문')) return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                    </svg>
                  );
                  return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  );
                };

                const getCategoryColor = (category) => {
                  if (category.includes('개인회생')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
                  if (category.includes('개인파산')) return 'bg-red-100 text-red-700 border-red-200';
                  if (category.includes('법인회생')) return 'bg-blue-100 text-blue-700 border-blue-200';
                  if (category.includes('법인파산')) return 'bg-orange-100 text-orange-700 border-orange-200';
                  if (category.includes('질문')) return 'bg-purple-100 text-purple-700 border-purple-200';
                  return 'bg-gray-100 text-gray-700 border-gray-200';
                };

                return (
                  <div key={post.id} className="group relative">
                    <Link href={`/post/${post.id}`} className="block">
                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200">
                        {/* 번호와 카테고리 */}
                        <div className="flex items-center gap-4 mb-3">
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-full text-xs font-medium min-w-[2rem] text-center">
                            {startIndex + idx + 1}
                          </span>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getCategoryColor(post.category)}`}>
                            {getCategoryIcon(post.category)}
                            {post.category}
                          </span>
                          <div className="ml-auto text-xs text-gray-500 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {post.created_at.slice(5, 10)}
                          </div>
                        </div>
                        
                        {/* 제목 */}
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-6 mb-4 px-3">
                          {post.title}
                        </h3>
                        
                        {/* 메타 정보 */}
                        <div className="flex items-center justify-between text-sm text-gray-600 px-3">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                              {post.nickname}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              {post.view_count}
                            </span>
                            {post.comment_count > 0 && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <FontAwesomeIcon icon={faComment} className="w-3.5 h-3.5" />
                                {post.comment_count}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-orange-600 font-medium">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                            {getCheerCount(post.id)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* 페이징 네비게이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 gap-2">
                {/* 처음 페이지 */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="group flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5 group-disabled:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  처음
                </button>

                {/* 이전 페이지 */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="group flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5 group-disabled:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  이전
                </button>

                {/* 페이지 번호들 */}
                <div className="flex gap-1">
                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[2.5rem] h-10 flex items-center justify-center text-sm font-semibold rounded-lg transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-105'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* 다음 페이지 */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="group flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
                >
                  다음
                  <svg className="w-3.5 h-3.5 group-disabled:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* 마지막 페이지 */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="group flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200"
                >
                  마지막
                  <svg className="w-3.5 h-3.5 group-disabled:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
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

            {/* 트렌딩 포스트 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl shadow-sm border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-bold text-white text-sm">실시간 인기</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {popularPosts.map((post, idx) => (
                    <Link key={post.id} href={`/post/${post.id}`} className="group block">
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/70 transition-all duration-200 hover:shadow-sm">
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 group-hover:scale-110 ${
                          idx === 0 ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md' :
                          idx === 1 ? 'bg-gradient-to-r from-orange-300 to-red-400 text-white shadow-md' :
                          idx === 2 ? 'bg-gradient-to-r from-orange-200 to-red-300 text-white shadow-md' :
                          'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-600 shadow-sm'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-5">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              {post.view_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 000 4zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                              </svg>
                              {post.nickname}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 최신 글 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3">
                <div className="flex items-center gap-2">
                                    <div className="relative">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11.414 10l4.293-4.293a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="font-bold text-white text-sm">최신 게시글</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {normalPosts.slice(0, 5).map((post, idx) => (
                    <Link key={post.id} href={`/post/${post.id}`} className="group block">
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/70 transition-all duration-200 hover:shadow-sm">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 group-hover:bg-indigo-500 transition-colors"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-5">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 000 4zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                              </svg>
                              {post.nickname}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {post.created_at.slice(5, 10)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 