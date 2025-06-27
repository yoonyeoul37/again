"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { samplePosts } from "@/data/sampleData";
import AdSlot from "@/components/AdSlot";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faComment, faImage } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';

// 샘플 공지/광고 데이터
const notices = [
  { id: "notice1", type: "공지", title: "[ 공지사항 ] 전문가 그 순간 로그인입니다.", nickname: "운영자", date: "2024-06-22", views: 113196, likes: 0 },
];
const ads = [
  { id: "ad1", type: "AD", title: "[AD] 좌파들을 이길 수 있는 필승 전략", nickname: "익명", date: "2024-06-22", views: 6968, likes: 0 },
];

function useRegionAd() {
  const [ad, setAd] = useState(null); // 기본값 null
  const [actualAds, setActualAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string>('');

  useEffect(() => {
    // 실제 광고 데이터 가져오기 (실전 서비스 방식)
    async function fetchAds() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('status', 'active')
          // .gte('start_date', today)
          // .lte('end_date', today)
          .order('created_at', { ascending: false });
        if (error) {
          console.error('광고 로드 실패:', error);
        } else {
          setActualAds(data || []);
          console.log('실전 조건 광고:', data);
        }
      } catch (error) {
        console.error('광고 로드 중 오류:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, []);

  // IP 기반 위치 감지 (무료 API)
  const getLocationByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      console.log('IP 기반 위치:', data);
      return data.city || data.region || '';
    } catch (error) {
      console.log('IP 기반 위치 감지 실패:', error);
      return '';
    }
  };

  // 위치 기반 광고 매칭
  const matchLocationToAd = (location: string) => {
    console.log('사용자 위치:', location);
    
    // 실제 광고 데이터에서 위치 매칭
    if (actualAds.length > 0) {
      const matchingAd = actualAds.find(ad => {
        if (ad.ad_type === 'major') {
          // 대도시 전체 광고 매칭
          const majorCityMap: { [key: string]: string[] } = {
            'seoul': ['서울', '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
            'busan': ['부산', '강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'],
            'daegu': ['대구', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
            'incheon': ['인천', '계양구', '남구', '남동구', '동구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
            'daejeon': ['대전', '대덕구', '동구', '서구', '유성구', '중구'],
            'gwangju': ['광주', '광산구', '남구', '동구', '북구', '서구'],
            'ulsan': ['울산', '남구', '동구', '북구', '울주군', '중구'],
            'sejong': ['세종', '세종특별자치시']
          };
          
          const cityRegions = majorCityMap[ad.major_city || ''] || [];
          return cityRegions.some(region => location.includes(region));
        } else if (ad.ad_type === 'regional' && ad.regions) {
          // 중소도시/군 선택 광고 매칭
          const regionMap: { [key: string]: string } = {
            'suwon': '수원시', 'seongnam': '성남시', 'bucheon': '부천시', 'ansan': '안산시',
            'anyang': '안양시', 'pyeongtaek': '평택시', 'dongducheon': '동두천시',
            'uijeongbu': '의정부시', 'goyang': '고양시', 'gwangmyeong': '광명시',
            'gwangju_gyeonggi': '광주시', 'yongin': '용인시', 'paju': '파주시',
            'icheon': '이천시', 'anseong': '안성시', 'gimpo': '김포시',
            'hwaseong': '화성시', 'yangju': '양주시', 'pocheon': '포천시',
            'yeoju': '여주시', 'gapyeong': '가평군', 'yangpyeong': '양평군',
            'yeoncheon': '연천군'
          };
          
          return ad.regions.some(region => {
            const regionName = regionMap[region] || region;
            return location.includes(regionName);
          });
        }
        return false;
      });
      
      if (matchingAd) {
        console.log('매칭된 광고:', matchingAd);
        return {
          image: matchingAd.image_url || '',
          text: `${matchingAd.title} - ${matchingAd.phone}`,
          advertiser: matchingAd.advertiser
        };
      }
    }
    
    // 매칭되는 광고가 없으면 null 반환
    return null;
  };

  useEffect(() => {
    const detectLocation = async () => {
      // 1. 브라우저 Geolocation 시도
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log('GPS 위치:', latitude, longitude);
          
          // 임시로 하드코딩된 위치 매핑 (개발용)
          let detectedLocation = '';
          if (latitude > 37.5 && latitude < 37.7 && longitude > 126.9 && longitude < 127.1) {
            detectedLocation = '강남구'; // 서울 강남구 근처
          } else if (latitude > 37.4 && latitude < 37.6 && longitude > 126.7 && longitude < 126.9) {
            detectedLocation = '송파구'; // 서울 송파구 근처
          } else {
            detectedLocation = '서울'; // 기본값
          }
          
          setUserLocation(detectedLocation);
          const matchedAd = matchLocationToAd(detectedLocation);
          setAd(matchedAd);
        }, async (error) => {
          console.log('GPS 위치 감지 실패:', error);
          // 2. IP 기반 위치 감지로 폴백
          const ipLocation = await getLocationByIP();
          setUserLocation(ipLocation);
          const matchedAd = matchLocationToAd(ipLocation);
          setAd(matchedAd);
        });
      } else {
        // 3. IP 기반 위치 감지
        const ipLocation = await getLocationByIP();
        setUserLocation(ipLocation);
        const matchedAd = matchLocationToAd(ipLocation);
        setAd(matchedAd);
      }
    };

    detectLocation();
  }, [actualAds]);

  return { ad, actualAds, loading, userLocation };
}

export default function HomePage() {
  const { ad, actualAds, loading, userLocation } = useRegionAd();
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [mounted, setMounted] = useState(false);
  const [mainPageSettings, setMainPageSettings] = useState({
    hopeImage: '/globe.svg',
    hopeMessage: '희망은 언제나 가까이에 있습니다.\n함께 힘내요!'
  });

  const PAGE_SIZE = 20;

  useEffect(() => {
    setMounted(true);
    async function fetchPosts() {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setPosts(data);
      }
    }
    fetchPosts();
    fetchMainPageSettings();
  }, []);

  const fetchMainPageSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'main_page_hope')
        .single();

      if (error) {
        // 테이블이 없거나 데이터가 없는 경우 기본값 사용
        console.log('설정을 불러올 수 없어 기본값을 사용합니다:', error.message);
        return;
      }

      if (data) {
        setMainPageSettings({
          hopeImage: data.hope_image || '/globe.svg',
          hopeMessage: data.hope_message || '희망은 언제나 가까이에 있습니다.\n함께 힘내요!'
        });
      }
    } catch (error) {
      console.log('설정 불러오기 중 오류 발생, 기본값 사용:', error);
    }
  };

  // 카테고리별 필터링 함수
  const getFilteredPosts = () => {
    if (selectedCategory === '전체') {
      return posts;
    } else if (selectedCategory === '개인회생') {
      return posts.filter(post => post.category === '개인회생');
    } else {
      return posts.filter(post => post.category === selectedCategory);
    }
  };

  // 공지글과 일반글 분리 및 정렬 (실제 posts 데이터 기준)
  const noticePosts = posts.filter(post => post.isNotice);
  const normalPosts = posts.filter(post => !post.isNotice);
  const sortedPosts = [...noticePosts, ...normalPosts];

  const filteredPosts = getFilteredPosts();
  const totalPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const paginatedPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 카테고리 변경 시 페이지 1로 리셋
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  // 베스트글 테스트
  const bestPosts = samplePosts.filter(post => post.likes >= 10);

  // 랜덤 광고 선택 함수
  const getRandomAd = () => {
    if (!actualAds || actualAds.length === 0) return undefined;
    const idx = Math.floor(Math.random() * actualAds.length);
    return actualAds[idx];
  };

  function isNew(created_at: string) {
    const today = new Date();
    const created = new Date(created_at);
    return (
      created.getFullYear() === today.getFullYear() &&
      created.getMonth() === today.getMonth() &&
      created.getDate() === today.getDate()
    );
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      {/* 상단 로그인/회원가입 버튼 삭제됨 */}

      {/* 상단 네비게이션/로고/메뉴/글쓰기 버튼 완전 삭제 */}

      {/* 메인 바로가기 버튼 삭제됨 */}

      {/* 위치 정보 표시 (개발용) 삭제 */}

      {/* 게시글 표 */}
      <main className="mx-auto mt-8 mb-12" style={{maxWidth: '1200px'}}>
        {/* 리스트 위 배너 광고 (위치기반) */}
        <div className="mb-6">
          {!loading && ad ? (
            // 실제 광고주가 등록한 광고 (실전 서비스 방식)
            <div className="w-full relative overflow-hidden rounded-xl shadow-lg">
              {ad.image ? (
                ad.website ? (
                  <a 
                    href={ad.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full h-48 bg-cover bg-center relative hover:opacity-90 transition-opacity"
                    style={{
                      backgroundImage: `url('${ad.image}')`,
                    }}
                  >
                    {/* 텍스트 오버레이 제거 - 이미지에 이미 연락처와 회사명이 포함되어 있음 */}
                  </a>
                ) : (
                  <div
                    className="w-full h-48 bg-cover bg-center relative"
                    style={{
                      backgroundImage: `url('${ad.image}')`,
                    }}
                  >
                    {/* 텍스트 오버레이 제거 - 이미지에 이미 연락처와 회사명이 포함되어 있음 */}
                  </div>
                )
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <h3 className="text-2xl font-bold mb-2">{ad.title}</h3>
                    <p className="text-lg mb-2">{ad.description}</p>
                    <div className="text-sm">
                      {ad.advertiser} | ☎ {ad.phone}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) :
            // 기본 지역별 광고
            mounted && (
              <div
                className="w-full relative overflow-hidden rounded-xl shadow-lg"
                style={{
                  backgroundImage: `url('${ad?.image || ''}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '200px'
                }}
              >
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full py-12 text-white text-center">
                  <span className="text-3xl font-bold drop-shadow-lg">{ad?.text || ''}</span>
                </div>
              </div>
            )
          }
        </div>
        
        {/* 2단 레이아웃: 게시판 + 카테고리 정보 */}
        <div className="flex gap-8">
          {/* 왼쪽: 게시판 */}
          <div className="flex-1 min-w-0">
            {/* 게시판 제목 */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-md border border-gray-100 p-8 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                <h1 className="text-xl font-bold text-blue-900">개인·법인 회생파산 자유게시판</h1>
              </div>
              <div className="border-b border-gray-200 mb-3" />
              <p className="text-xs text-gray-400 leading-relaxed">
                부채 문제로 고민하는 분들을 위한 익명 커뮤니티입니다.<br />
                개인회생, 파산, 법인회생, 워크아웃 등에 대한 정보와 경험을 나누세요.
              </p>
            </div>
            
            {/* 카테고리 필터 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex gap-2 items-center flex-wrap justify-between">
                <div className="flex gap-2 items-center flex-wrap min-w-0 flex-1 justify-center">
                  <button
                    onClick={() => handleCategoryChange('전체')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '전체' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => handleCategoryChange('개인회생')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '개인회생' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    개인회생
                  </button>
                  <button
                    onClick={() => handleCategoryChange('개인파산')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '개인파산' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    개인파산
                  </button>
                  <button
                    onClick={() => handleCategoryChange('법인회생')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '법인회생' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    법인회생
                  </button>
                  <button
                    onClick={() => handleCategoryChange('법인파산')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '법인파산' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    법인파산
                  </button>
                  <button
                    onClick={() => handleCategoryChange('워크아웃')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '워크아웃' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    워크아웃
                  </button>
                  <button
                    onClick={() => handleCategoryChange('신용회복위원회')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '신용회복위원회' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    신용회복위원회
                  </button>
                  <button
                    onClick={() => handleCategoryChange('대출관련')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '대출관련' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    대출관련
                  </button>
                  <button
                    onClick={() => handleCategoryChange('신용카드')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '신용카드' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    신용카드
                  </button>
                  <button
                    onClick={() => handleCategoryChange('신용점수')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '신용점수' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    신용점수
                  </button>
                  <button
                    onClick={() => handleCategoryChange('회생절차')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '회생절차' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    회생절차
                  </button>
                  <button
                    onClick={() => handleCategoryChange('상환계획')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '상환계획' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    상환계획
                  </button>
                  <button
                    onClick={() => handleCategoryChange('법무사상담')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '법무사상담' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    법무사상담
                  </button>
                  <button
                    onClick={() => handleCategoryChange('변호사상담')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '변호사상담' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    변호사상담
                  </button>
                  <button
                    onClick={() => handleCategoryChange('회생비용')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '회생비용' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    회생비용
                  </button>
                  <button
                    onClick={() => handleCategoryChange('파산비용')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '파산비용' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    파산비용
                  </button>
                  <button
                    onClick={() => handleCategoryChange('면책결정')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '면책결정' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    면책결정
                  </button>
                  <button
                    onClick={() => handleCategoryChange('신용회복')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '신용회복' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    신용회복
                  </button>
                  <button
                    onClick={() => handleCategoryChange('인가결정')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '인가결정' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    인가결정
                  </button>
                  <button
                    onClick={() => handleCategoryChange('셀프신청')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '셀프신청' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    셀프신청
                  </button>
                  <button
                    onClick={() => handleCategoryChange('개인신청')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '개인신청' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    개인신청
                  </button>
                  <button
                    onClick={() => handleCategoryChange('취업')}
                    className={`h-8 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 whitespace-nowrap ${
                      selectedCategory === '취업' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    취업관련
                  </button>
                </div>
              </div>
            </div>

            {/* 글쓰기 버튼 */}
            <div className="flex justify-end mb-4">
              <Link
                href="/board/write"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                글쓰기
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* 표 헤더 */}
              <div className="flex items-center bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700">
                <div className="w-16 text-center py-3">번호</div>
                <div className="w-24 text-center py-3">말머리</div>
                <div className="flex-1 flex items-center py-3 justify-center">
                  <span>제목</span>
                </div>
                <div className="w-28 text-center py-3">닉네임</div>
                <div className="w-24 text-center py-3">날짜</div>
                <div className="w-20 text-center py-3">조회수</div>
                <div className="w-20 text-center py-3">힘내</div>
              </div>
              {/* 공지글 */}
              {noticePosts.map((post) => (
                <div key={post.id} className="flex items-center border-b border-gray-200 text-xs bg-red-50 font-bold text-red-700">
                  <div className="w-16 text-center py-2">공지</div>
                  <div className="w-24 text-center py-2"><span className="bg-red-500 text-white px-2 py-1 rounded text-xs">공지</span></div>
                  <div className="flex-1 text-left pl-4 flex items-center gap-2 min-w-0">
                    <div className="flex-1 min-w-0 flex items-center">
                      <Link href={`/post/${post.id}`} className="truncate font-medium hover:text-red-600 transition-colors text-xs text-gray-900 block max-w-full">
                        {post.title}
                        {post.images && post.images.length > 0 && (
                          <span className="ml-1 text-gray-400 text-xs">
                            <FontAwesomeIcon icon={faImage} />
                          </span>
                        )}
                        {isNew(post.created_at) && <span className="ml-1 text-[8px] text-red-500 font-normal align-middle">NEW</span>}
                        {post.comment_count > 0 && (
                          <span className="ml-2 text-red-400 text-[11px] align-middle">
                            <FontAwesomeIcon icon={faComment} className="mr-1" />{post.comment_count}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                  <div className="w-28 text-center text-xs">{post.nickname}</div>
                  <div className="w-24 text-center text-xs">
                    <div className="text-gray-400 text-xs">{post.created_at ? new Date(post.created_at).getFullYear() : ''}</div>
                    <div>{post.created_at ? (() => { const d = new Date(post.created_at); return `${d.getMonth() + 1}.${d.getDate()}`; })() : ''}</div>
                  </div>
                  <div className="w-20 text-center text-xs">{post.view_count ?? 0}</div>
                  <div className="w-20 text-center text-xs">{post.likes ?? 0}</div>
                </div>
              ))}
              {/* 일반글 */}
              {paginatedPosts.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-lg">게시글이 없습니다.</div>
              ) : (
                paginatedPosts.map((post, idx) => (
                  <div
                    key={post.id}
                    className={`flex items-center border-b border-gray-100 text-xs hover:bg-blue-50 cursor-pointer transition-colors duration-200 group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="w-16 text-center text-gray-500 py-2">{(page - 1) * PAGE_SIZE + idx + 1}</div>
                    <div className="w-24 text-center py-2">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{post.category}</span>
                    </div>
                    <div className="flex-1 text-left pl-4 min-w-0 py-2 flex items-center gap-2">
                      <div className="flex-1 min-w-0 flex items-center">
                        <Link href={`/post/${post.id}`} className="truncate font-medium group-hover:text-blue-600 transition-colors text-xs text-gray-900 block max-w-full">
                          {post.title}
                          {post.images && post.images.length > 0 && (
                            <span className="ml-1 text-gray-400 text-xs">
                              <FontAwesomeIcon icon={faImage} />
                            </span>
                          )}
                          {isNew(post.created_at) && <span className="ml-1 text-[8px] text-red-500 font-normal align-middle">NEW</span>}
                          {post.comment_count > 0 && (
                            <span className="ml-2 text-blue-400 text-[11px] align-middle">
                              <FontAwesomeIcon icon={faComment} className="mr-1" />{post.comment_count}
                            </span>
                          )}
                        </Link>
                      </div>
                    </div>
                    <div className="w-28 text-center font-normal truncate text-xs text-gray-700 py-2">{post.nickname}</div>
                    <div className="w-24 text-center text-gray-500 font-normal text-xs py-2">
                      <div className="text-gray-400 text-xs">{post.created_at ? new Date(post.created_at).getFullYear() : ''}</div>
                      <div>{post.created_at ? (() => { const d = new Date(post.created_at); return `${d.getMonth() + 1}.${d.getDate()}`; })() : ''}</div>
                    </div>
                    <div className="w-20 text-center text-gray-500 font-normal text-xs py-2">{post.view_count ?? 0}</div>
                    <div className="w-20 text-center text-orange-600 font-semibold text-xs py-2">{post.likes ?? 0}</div>
                  </div>
                ))
              )}
            </div>
            {/* 페이지네이션 */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 ${page === num ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            
            {/* 하단 광고 */}
            <AdSlot position="bottom" ad={getRandomAd()} />
          </div>
          
          {/* 오른쪽: 사이드바 광고 */}
          <div className="w-80 flex-shrink-0">
            <div className="space-y-6">
              {/* 예시 이미지 및 안내 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                {/* 이미지 변경 방법: public 폴더에 이미지를 넣고 아래 src 경로를 변경하세요 */}
                {/* 예: src="/your-image.jpg" 또는 src="/your-image.png" */}
                <img src={mainPageSettings.hopeImage} alt="희망 이미지" className="w-24 h-24 mb-4 opacity-80" />
                <p className="text-xs text-gray-500 text-center whitespace-pre-line">{mainPageSettings.hopeMessage}</p>
              </div>
              {/* 사이드바 광고 */}
              <AdSlot position="sidebar" />
              
              {/* 카테고리 안내 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">카테고리 안내</h3>
              <div className="space-y-5">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-700 mb-2 text-xs">[개인회생]</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">개인의 부채 문제를 해결하는 법적 절차. 일정 기간 동안 소득에서 일부를 변제하면 나머지 부채가 면제됩니다.</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-red-700 mb-2 text-xs">[개인파산]</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">개인이 감당할 수 없는 모든 부채를 면제받는 절차. 신용회복에 시간이 걸릴 수 있습니다.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-700 mb-2 text-xs">[법인회생]</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">법인의 부채를 정리하고 재건하는 절차. 사업을 계속하면서 부채를 조정할 수 있습니다.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-700 mb-2 text-xs">[법인파산]</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">법인의 모든 부채를 면제받는 절차. 사업을 중단하고 재산을 정리합니다.</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-700 mb-2 text-xs">[워크아웃]</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">법원 개입 없이 채권자와 협의하여 부채를 조정하는 방법입니다.</p>
                </div>
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="font-semibold text-indigo-700 mb-2 text-xs">[신용회복위원회]</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">부채 조정과 신용회복을 지원하는 공공기관입니다.</p>
                  </div>
                  <div className="border-l-4 border-teal-500 pl-4">
                    <h4 className="font-semibold text-teal-700 mb-2 text-xs">[대출관련]</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">대출 상환, 이자 감면, 대출 한도 등 대출 관련 문의사항입니다.</p>
                  </div>
                  <div className="border-l-4 border-pink-500 pl-4">
                    <h4 className="font-semibold text-pink-700 mb-2 text-xs">[신용카드]</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">신용카드 발급, 한도 조정, 연체 해결 등 카드 관련 문의사항입니다.</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-semibold text-yellow-700 mb-2 text-xs">[신용점수]</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">신용점수 향상, 조회 방법, 회복 기간 등 신용점수 관련 문의사항입니다.</p>
                  </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 text-xs mb-3">💡 이용 팁</h4>
                <ul className="text-xs text-blue-800 space-y-2">
                  <li>• 상황을 간단히 적어주세요</li>
                  <li>• 개인정보는 포함하지 마세요</li>
                  <li>• 전문가 상담을 권장합니다</li>
                </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 삭제됨: layout.tsx의 푸터만 사용 */}
    </div>
  );
}
