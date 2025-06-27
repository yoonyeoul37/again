"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyAdsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'advertiser')) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchAds() {
      setLoading(true);
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        alert('광고 목록 불러오기 실패: ' + error.message);
      } else {
        setAds(data || []);
      }
      setLoading(false);
    }
    fetchAds();
  }, [user]);

  // 페이징 계산
  const totalPages = Math.ceil(ads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAds = ads.slice(startIndex, endIndex);

  // 페이지 변경 함수
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return '대기중';
    if (now >= start && now <= end) return '진행중';
    return '종료';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '진행중': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case '대기중': return 'bg-gray-50 text-gray-700 border border-gray-200';
      case '종료': return 'bg-gray-100 text-gray-600 border border-gray-300';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // 광고 지역 정보를 표시하는 함수
  const getAdLocationText = (ad: any) => {
    if (ad.ad_type === 'major') {
      const majorCityMap: { [key: string]: string } = {
        'seoul': '서울 전체 (25개 구)',
        'busan': '부산 전체 (16개 구/군)',
        'daegu': '대구 전체 (8개 구/군)',
        'incheon': '인천 전체 (10개 구/군)',
        'daejeon': '대전 전체 (5개 구)',
        'gwangju': '광주 전체 (5개 구)',
        'ulsan': '울산 전체 (5개 구/군)',
        'sejong': '세종특별자치시'
      };
      return majorCityMap[ad.major_city] || '대도시 전체';
    } else if (ad.ad_type === 'regional' && ad.regions) {
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
      const regionNames = ad.regions.map((region: string) => regionMap[region] || region);
      return regionNames.join(', ');
    }
    return '지역 미지정';
  };

  if (loading || isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
        <Link href="/login" className="text-blue-600 hover:text-blue-700">로그인하기</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">내 광고 목록</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/advertiser/ads/new" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                새 광고 등록
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ads.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 광고가 없습니다</h3>
            <p className="text-gray-500 mb-6">첫 번째 광고를 등록해보세요!</p>
            <Link 
              href="/advertiser/ads/new" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              새 광고 등록하기
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-2 text-center">이미지</div>
                <div className="col-span-3 text-left">광고 정보</div>
                <div className="col-span-1 text-center">상태</div>
                <div className="col-span-2 text-center">지역</div>
                <div className="col-span-2 text-center">계약 기간</div>
                <div className="col-span-2 text-center">설정</div>
              </div>
            </div>
            
            {/* 테이블 본문 */}
            <div className="divide-y divide-gray-200">
              {currentAds.map((ad: any) => {
                const status = getStatusText(ad.start_date, ad.end_date);
                return (
                  <div key={ad.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* 이미지 */}
                      <div className="col-span-2 flex justify-center">
                        <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {ad.image_url ? (
                            <img 
                              src={ad.image_url} 
                              alt={ad.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${ad.image_url ? 'hidden' : ''}`}>
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* 광고 정보 */}
                      <div className="col-span-3">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {ad.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {ad.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {ad.advertiser}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {ad.phone}
                          </div>
                        </div>
                      </div>
                      
                      {/* 상태 */}
                      <div className="col-span-1 flex justify-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      
                      {/* 지역 */}
                      <div className="col-span-2 text-center">
                        <span className="text-sm text-gray-700">
                          {getAdLocationText(ad)}
                        </span>
                      </div>
                      
                      {/* 계약 기간 */}
                      <div className="col-span-2 text-center">
                        <div className="text-sm text-gray-700">
                          <div>{formatDate(ad.start_date)}</div>
                          <div className="text-xs text-gray-500">~ {formatDate(ad.end_date)}</div>
                        </div>
                      </div>
                      
                      {/* 설정 버튼 */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex gap-2">
                          <Link
                            href={`/advertiser/ads/edit/${ad.id}`}
                            className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-xs font-medium transition-colors"
                          >
                            수정
                          </Link>
                          <button
                            onClick={async () => {
                              if (confirm('정말 이 광고를 삭제하시겠습니까?')) {
                                const { error } = await supabase.from('ads').delete().eq('id', ad.id);
                                if (error) {
                                  alert('삭제 실패: ' + error.message);
                                } else {
                                  setAds(prev => prev.filter((item: any) => item.id !== ad.id));
                                  alert('광고가 삭제되었습니다.');
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-medium transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 페이징 UI */}
            {totalPages > 1 && (
              <div className="bg-white px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    총 {ads.length}개 광고 중 {startIndex + 1}-{Math.min(endIndex, ads.length)}개 표시
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* 이전 버튼 */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      이전
                    </button>
                    
                    {/* 페이지 번호 */}
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((page, index) => (
                        <div key={index}>
                          {page === '...' ? (
                            <span className="px-2 py-1 text-gray-500">...</span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(page as number)}
                              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* 다음 버튼 */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 