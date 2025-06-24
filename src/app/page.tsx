"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { samplePosts } from "@/data/sampleData";
import AdSlot from "@/components/AdSlot";

// 샘플 공지/광고 데이터
const notices = [
  { id: "notice1", type: "공지", title: "[ 공지사항 ] 전문가 그 순간 로그인입니다.", nickname: "운영자", date: "2024-06-22", views: 113196, likes: 0 },
];
const ads = [
  { id: "ad1", type: "AD", title: "[AD] 좌파들을 이길 수 있는 필승 전략", nickname: "익명", date: "2024-06-22", views: 6968, likes: 0 },
];

// 지역별 광고 데이터
const regionAds = {
  '송파구': { image: '/ad-songpa.jpg', text: '송파구 법무사 무료상담 ☎ 02-1234-5678' },
  '강남구': { image: '/ad-gangnam.jpg', text: '강남구 법무사 무료상담 ☎ 02-2345-6789' },
  default: { image: '/001.jpg', text: '전국 법무사 무료상담 ☎ 1588-0000' }
};

function useRegionAd() {
  const [ad, setAd] = useState(regionAds.default);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      // 카카오 REST API Key 필요! 아래 YOUR_REST_API_KEY를 발급받은 키로 교체하세요.
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${longitude}&y=${latitude}`,
        { headers: { Authorization: 'KakaoAK YOUR_REST_API_KEY' } }
      );
      const data = await res.json();
      const regionName = data.documents?.[0]?.region_2depth_name || '';
      setAd(regionAds[regionName] || regionAds.default);
    }, () => {
      setAd(regionAds.default);
    });
  }, []);
  return ad;
}

const PAGE_SIZE = 20;

export default function HomePage() {
  // 일반글 번호는 최신순(샘플)
  const posts = [...samplePosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('전체'); // 카테고리 필터 상태 추가
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const paginatedPosts = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const [mounted, setMounted] = useState(false);
  const ad = useRegionAd();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 카테고리별 필터링 함수
  const getFilteredPosts = () => {
    if (selectedCategory === '전체') {
      return posts;
    } else if (selectedCategory === '개인회생') {
      return posts.filter(post => post.category === '개인회생');
    } else if (selectedCategory === '개인파산') {
      return posts.filter(post => post.category === '개인파산');
    } else if (selectedCategory === '법인회생') {
      return posts.filter(post => post.category === '법인회생');
    } else if (selectedCategory === '법인파산') {
      return posts.filter(post => post.category === '법인파산');
    } else if (selectedCategory === '워크아웃') {
      return posts.filter(post => post.category === '워크아웃');
    } else if (selectedCategory === '신용회복위원회') {
      return posts.filter(post => post.category === '신용회복위원회');
    } else if (selectedCategory === '대출관련') {
      return posts.filter(post => post.category === '대출관련');
    } else if (selectedCategory === '신용카드') {
      return posts.filter(post => post.category === '신용카드');
    } else if (selectedCategory === '신용점수') {
      return posts.filter(post => post.category === '신용점수');
    } else if (selectedCategory === '회생절차') {
      return posts.filter(post => post.category === '회생절차');
    } else if (selectedCategory === '상환계획') {
      return posts.filter(post => post.category === '상환계획');
    } else if (selectedCategory === '법무사상담') {
      return posts.filter(post => post.category === '법무사상담');
    } else if (selectedCategory === '회생비용') {
      return posts.filter(post => post.category === '회생비용');
    } else if (selectedCategory === '파산비용') {
      return posts.filter(post => post.category === '파산비용');
    } else if (selectedCategory === '재산관리') {
      return posts.filter(post => post.category === '재산관리');
    } else if (selectedCategory === '면책결정') {
      return posts.filter(post => post.category === '면책결정');
    } else if (selectedCategory === '신용회복') {
      return posts.filter(post => post.category === '신용회복');
    } else if (selectedCategory === '인가결정') {
      return posts.filter(post => post.category === '인가결정');
    } else if (selectedCategory === '셀프신청') {
      return posts.filter(post => post.category === '셀프신청');
    } else if (selectedCategory === '개인신청') {
      return posts.filter(post => post.category === '개인신청');
    } else if (selectedCategory === '취업') {
      return posts.filter(post => post.category === '취업');
    }
    return posts;
  };

  const filteredPosts = getFilteredPosts();
  const totalFilteredPages = Math.ceil(filteredPosts.length / PAGE_SIZE);
  const paginatedFilteredPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 카테고리 변경 시 페이지 1로 리셋
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      {/* 상단 네비게이션/로고/메뉴/글쓰기 버튼 완전 삭제 */}

      {/* 메인 바로가기 버튼 삭제됨 */}

      {/* 게시글 표 */}
      <main className="mx-auto mt-6 mb-8" style={{maxWidth: '1200px'}}>
        {/* 리스트 위 배너 광고 (위치기반) */}
        <div className="mb-4">
          {mounted && (
            <div
              className="w-full relative overflow-hidden my-4"
              style={{
                backgroundImage: `url('${ad.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '180px'
              }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex flex-col items-center justify-center h-full py-8 text-white text-center">
                <span className="text-2xl font-extrabold drop-shadow">{ad.text}</span>
              </div>
            </div>
          )}
        </div>
        {/* 메인 게시판 리스트 위 글쓰기 버튼 */}
        {/* 삭제됨 */}
        
        {/* 2단 레이아웃: 게시판 + 카테고리 정보 */}
        <div className="flex gap-6">
          {/* 왼쪽: 게시판 */}
          <div className="flex-1 min-w-0">
            {/* 게시판 제목 */}
            <div className="bg-white rounded-t-lg border-b border-gray-200 p-4">
              <h1 className="text-xl font-bold text-gray-900 mb-2">개인·법인 회생파산 자유게시판</h1>
              <p className="text-xs text-gray-600">
                부채 문제로 고민하는 분들을 위한 익명 커뮤니티입니다.<br />
                개인회생, 파산, 법인회생, 워크아웃 등에 대한 정보와 경험을 나누세요.
              </p>
            </div>
            
            {/* 카테고리 필터 */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 relative">
              <div className="flex gap-1 items-center flex-wrap justify-between">
                <div className="flex gap-1 items-center flex-wrap min-w-0 flex-1 justify-center">
                  <button
                    onClick={() => handleCategoryChange('전체')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '전체' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => handleCategoryChange('개인회생')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '개인회생' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    개인회생
                  </button>
                  <button
                    onClick={() => handleCategoryChange('개인파산')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '개인파산' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    개인파산
                  </button>
                  <button
                    onClick={() => handleCategoryChange('법인회생')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '법인회생' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    법인회생
                  </button>
                  <button
                    onClick={() => handleCategoryChange('법인파산')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '법인파산' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    법인파산
                  </button>
                  <button
                    onClick={() => handleCategoryChange('워크아웃')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '워크아웃' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    워크아웃
                  </button>
                  <button
                    onClick={() => handleCategoryChange('신용회복위원회')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '신용회복위원회' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    신용회복위원회
                  </button>
                  <button
                    onClick={() => handleCategoryChange('대출관련')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '대출관련' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    대출관련
                  </button>
                  <button
                    onClick={() => handleCategoryChange('신용카드')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '신용카드' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    신용카드
                  </button>
                  <button
                    onClick={() => handleCategoryChange('신용점수')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '신용점수' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    신용점수
                  </button>
                  <button
                    onClick={() => handleCategoryChange('회생절차')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '회생절차' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    회생절차
                  </button>
                  <button
                    onClick={() => handleCategoryChange('상환계획')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '상환계획' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    상환계획
                  </button>
                  <button
                    onClick={() => handleCategoryChange('법무사상담')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '법무사상담' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    법무사상담
                  </button>
                  <button
                    onClick={() => handleCategoryChange('회생비용')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '회생비용' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    회생비용
                  </button>
                  <button
                    onClick={() => handleCategoryChange('파산비용')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '파산비용' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    파산비용
                  </button>
                  <button
                    onClick={() => handleCategoryChange('재산관리')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '재산관리' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    재산관리
                  </button>
                  <button
                    onClick={() => handleCategoryChange('면책결정')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '면책결정' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    면책결정
                  </button>
                  <button
                    onClick={() => handleCategoryChange('신용회복')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '신용회복' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    신용회복
                  </button>
                  <button
                    onClick={() => handleCategoryChange('인가결정')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '인가결정' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    인가결정
                  </button>
                  <button
                    onClick={() => handleCategoryChange('셀프신청')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '셀프신청' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    셀프신청
                  </button>
                  <button
                    onClick={() => handleCategoryChange('개인신청')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '개인신청' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    개인신청
                  </button>
                  <button
                    onClick={() => handleCategoryChange('취업')}
                    className={`h-8 px-2 py-1 rounded text-xs font-semibold border transition-colors whitespace-nowrap ${
                      selectedCategory === '취업' 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                    }`}
                  >
                    취업관련
                  </button>
                </div>
                {/* 검색창 오른쪽 정렬 */}
                {/* (상단 검색칸 전체 삭제) */}
              </div>
            </div>

            {/* 글쓰기 버튼을 표 헤더 위에 게시판 컨텐츠의 오른쪽 끝에 딱 맞게 정렬 */}
            <div className="w-full flex justify-end items-center px-0 py-2 bg-white border-b border-gray-100">
              <a
                href="/board/write"
                className="px-3 py-1 rounded text-xs font-semibold border border-gray-300 text-white hover:bg-gray-800 transition-colors"
                style={{minWidth:'64px',textAlign:'center',backgroundColor:'#333333'}}>
                글쓰기
              </a>
            </div>

            <div className="bg-white">
              {/* 표 헤더 */}
              <div className="flex items-center bg-gray-100 border-b border-gray-300 text-xs font-bold text-[#333333]">
                <div className="w-14 text-center py-2">번호</div>
                <div className="w-20 text-center py-2">말머리</div>
                <div className="flex-1 flex items-center py-2 pl-2">
                  <span>제목</span>
                  {/* 제목 옆에 심플한 검색어 입력란 */}
                  <form className="flex items-center ml-2" onSubmit={e => e.preventDefault()} style={{marginLeft: '130px'}}>
                    <input type="text" className="h-6 px-2 rounded-l text-xs focus:outline-none w-[180px]" placeholder="검색어" style={{border: '1px solid #cccccc'}} />
                    <button className="h-6 px-2 text-white rounded-r text-xs font-semibold hover:bg-gray-800 transition" style={{background: '#333333'}}>검색</button>
                  </form>
                </div>
                <div className="w-24 text-center py-2">닉네임</div>
                <div className="w-20 text-center py-2">날짜</div>
                <div className="w-20 text-center py-2">조회수</div>
                <div className="w-16 text-center py-2">힘내</div>
              </div>
              {/* 공지 */}
              {notices.map((n, idx) => (
                <div key={n.id} className="flex items-center bg-blue-50 border-b border-gray-200 text-xs font-semibold text-blue-700">
                  <div className="w-14 text-center">공지</div>
                  <div className="w-20 text-center">공지</div>
                  <div className="flex-1 text-left pl-2">
                    <Link href="#" className="hover:underline text-xs text-[#333333]">{n.title}</Link>
                  </div>
                  <div className="w-24 text-center text-xs text-[#333333]">{n.nickname}</div>
                  <div className="w-20 text-center text-xs">
                    <div className="text-gray-400 text-xs">{new Date(n.date).getFullYear()}</div>
                    <div>{new Date(n.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</div>
                  </div>
                  <div className="w-20 text-center text-xs">{n.views.toLocaleString()}</div>
                  <div className="w-16 text-center text-xs">{n.likes}</div>
                </div>
              ))}
              {/* 광고 */}
              {ads.map((ad, idx) => (
                <div key={ad.id} className="flex items-center bg-yellow-50 border-b border-gray-200 text-xs font-semibold text-yellow-700">
                  <div className="w-14 text-center">AD</div>
                  <div className="w-20 text-center">AD</div>
                  <div className="flex-1 text-left pl-2">
                    <Link href="#" className="hover:underline text-xs text-[#333333]">{ad.title}</Link>
                  </div>
                  <div className="w-24 text-center text-xs text-[#333333]">{ad.nickname}</div>
                  <div className="w-20 text-center text-xs">
                    <div className="text-gray-400 text-xs">{new Date(ad.date).getFullYear()}</div>
                    <div>{new Date(ad.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</div>
                  </div>
                  <div className="w-20 text-center text-xs">{ad.views.toLocaleString()}</div>
                  <div className="w-16 text-center text-xs">{ad.likes}</div>
                </div>
              ))}
              {/* 일반글 */}
              {paginatedFilteredPosts.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-lg">게시글이 없습니다.</div>
              ) : (
                paginatedFilteredPosts.map((post, idx) => (
                  <div
                    key={post.id}
                    className={`flex items-center border-b border-gray-200 text-xs hover:bg-blue-50 cursor-pointer transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <div className="w-14 text-center text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + idx + 1}</div>
                    <div className="w-20 text-center">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-[#333333]">{post.category}</span>
                    </div>
                    <div className="flex-1 text-left pl-2 min-w-0">
                      <Link href={`/post/${post.id}`} className="truncate font-medium group-hover:underline text-xs text-[#333333]">
                        {post.title}
                      </Link>
                      {post.commentCount > 0 && <span className="ml-1 text-gray-400 text-xs">💭 {post.commentCount}</span>}
                    </div>
                    <div className="w-24 text-center font-normal truncate text-xs text-[#333333]">{post.nickname}</div>
                    <div className="w-20 text-center text-gray-500 font-normal text-xs">
                      <div className="text-gray-400 text-xs">{new Date(post.createdAt).getFullYear()}</div>
                      <div>{new Date(post.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</div>
                    </div>
                    <div className="w-20 text-center text-gray-500 font-normal text-xs">{post.viewCount}</div>
                    <div className="w-16 text-center text-orange-600 font-bold text-xs">0</div>
                  </div>
                ))
              )}
            </div>
            {/* 페이지네이션 */}
            <div className="flex justify-center gap-1 mt-6">
              {Array.from({ length: totalFilteredPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-3 py-1 rounded text-sm font-semibold border ${page === num ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                >
                  {num}
                </button>
              ))}
            </div>
            {/* 리스트 아래 배너 광고 (위치기반) */}
            <div className="my-4">
              {mounted && (
                <div
                  className="w-full relative overflow-hidden my-4"
                  style={{
                    backgroundImage: `url('${ad.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '180px'
                  }}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative z-10 flex flex-col items-center justify-center h-full py-8 text-white text-center">
                    <span className="text-2xl font-extrabold drop-shadow">{ad.text}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* 하단 광고 */}
            <AdSlot position="bottom" />
          </div>
          
          {/* 오른쪽: 사이드바 광고 */}
          <div className="w-80 flex-shrink-0">
            <div className="space-y-6">
              {/* 사이드바 광고 */}
              <AdSlot position="sidebar" />
              
              {/* 카테고리 안내 */}
              <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">카테고리 안내</h3>
              <div className="space-y-4 text-sm">
                <div className="border-l-4 border-blue-500 pl-3">
                  <h4 className="font-semibold text-blue-700 mb-1">[개인회생]</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">개인의 부채 문제를 해결하는 법적 절차. 일정 기간 동안 소득에서 일부를 변제하면 나머지 부채가 면제됩니다.</p>
                </div>
                <div className="border-l-4 border-red-500 pl-3">
                  <h4 className="font-semibold text-red-700 mb-1">[개인파산]</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">개인이 감당할 수 없는 모든 부채를 면제받는 절차. 신용회복에 시간이 걸릴 수 있습니다.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-3">
                  <h4 className="font-semibold text-green-700 mb-1">[법인회생]</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">법인의 부채를 정리하고 재건하는 절차. 사업을 계속하면서 부채를 조정할 수 있습니다.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-3">
                  <h4 className="font-semibold text-orange-700 mb-1">[법인파산]</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">법인의 모든 부채를 면제받는 절차. 사업을 중단하고 재산을 정리합니다.</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-3">
                  <h4 className="font-semibold text-purple-700 mb-1">[워크아웃]</h4>
                  <p className="text-gray-600 text-xs leading-relaxed">법원 개입 없이 채권자와 협의하여 부채를 조정하는 방법입니다.</p>
                </div>
                  <div className="border-l-4 border-indigo-500 pl-3">
                    <h4 className="font-semibold text-indigo-700 mb-1">[신용회복위원회]</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">부채 조정과 신용회복을 지원하는 공공기관입니다.</p>
                  </div>
                  <div className="border-l-4 border-teal-500 pl-3">
                    <h4 className="font-semibold text-teal-700 mb-1">[대출관련]</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">대출 상환, 이자 감면, 대출 한도 등 대출 관련 문의사항입니다.</p>
                  </div>
                  <div className="border-l-4 border-pink-500 pl-3">
                    <h4 className="font-semibold text-pink-700 mb-1">[신용카드]</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">신용카드 발급, 한도 조정, 연체 해결 등 카드 관련 문의사항입니다.</p>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-3">
                    <h4 className="font-semibold text-yellow-700 mb-1">[신용점수]</h4>
                    <p className="text-gray-600 text-xs leading-relaxed">신용점수 향상, 조회 방법, 회복 기간 등 신용점수 관련 문의사항입니다.</p>
                  </div>
              </div>
              
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">💡 이용 팁</h4>
                <ul className="text-xs text-blue-800 space-y-1">
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
