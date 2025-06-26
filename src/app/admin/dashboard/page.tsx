'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

// 통계 데이터 타입
interface StatsData {
  totalAds: number;
  pendingAds: number;
  activeAds: number;
  totalRevenue: number;
  recentAds: any[];
  regionStats: { name: string; count: number; percentage: number }[];
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    totalAds: 0,
    pendingAds: 0,
    activeAds: 0,
    totalRevenue: 0,
    recentAds: [],
    regionStats: []
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 모든 광고 데이터 가져오기
      const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('광고 데이터 가져오기 실패:', error);
        return;
      }

      const adsData = ads || [];

      // 통계 계산
      const totalAds = adsData.length;
      const pendingAds = adsData.filter(ad => ad.status === 'pending').length;
      const activeAds = adsData.filter(ad => ad.status === 'active').length;

      // 수익 계산
      const totalRevenue = adsData.reduce((sum, ad) => {
        if (ad.ad_type === 'major') {
          const majorCityPrices: { [key: string]: number } = {
            'seoul': 110000,
            'busan': 88000,
            'daegu': 88000,
            'incheon': 88000,
            'daejeon': 88000,
            'gwangju': 88000,
            'ulsan': 88000,
            'sejong': 88000
          };
          return sum + (majorCityPrices[ad.major_city || ''] || 0);
        } else {
          return sum + 55000; // 중소도시/군
        }
      }, 0);

      // 최근 광고 (최근 5개)
      const recentAds = adsData.slice(0, 5);

      // 지역별 통계
      const regionCounts: { [key: string]: number } = {};
      adsData.forEach(ad => {
        if (ad.ad_type === 'major') {
          const region = ad.major_city || 'unknown';
          regionCounts[region] = (regionCounts[region] || 0) + 1;
        } else if (ad.regions) {
          ad.regions.forEach(region => {
            regionCounts[region] = (regionCounts[region] || 0) + 1;
          });
        }
      });

      const regionStats = Object.entries(regionCounts)
        .map(([name, count]) => ({
          name: getRegionDisplayName(name),
          count,
          percentage: totalAds > 0 ? Math.round((count / totalAds) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setStats({
        totalAds,
        pendingAds,
        activeAds,
        totalRevenue,
        recentAds,
        regionStats
      });
    } catch (error) {
      console.error('통계 데이터 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRegionDisplayName = (regionCode: string) => {
    const regionNames: { [key: string]: string } = {
      'seoul': '서울',
      'busan': '부산',
      'daegu': '대구',
      'incheon': '인천',
      'daejeon': '대전',
      'gwangju': '광주',
      'ulsan': '울산',
      'sejong': '세종',
      'suwon': '수원',
      'seongnam': '성남',
      'bucheon': '부천',
      'ansan': '안산',
      'anyang': '안양',
      'pyeongtaek': '평택',
      'dongducheon': '동두천',
      'uijeongbu': '의정부',
      'goyang': '고양',
      'gwangmyeong': '광명',
      'gwangju_gyeonggi': '광주시',
      'yongin': '용인',
      'paju': '파주',
      'icheon': '이천',
      'anseong': '안성',
      'gimpo': '김포',
      'hwaseong': '화성',
      'yangju': '양주',
      'pocheon': '포천',
      'yeoju': '여주',
      'gapyeong': '가평',
      'yangpyeong': '양평',
      'yeoncheon': '연천'
    };
    return regionNames[regionCode] || regionCode;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'pending': return '대기중';
      case 'approved': return '승인됨';
      case 'rejected': return '거부됨';
      default: return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 임시로 로그인 체크 비활성화
  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <p className="text-gray-600">로그인이 필요합니다.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
              {mounted && (
                <span className="text-sm text-gray-500">
                  {currentTime.toLocaleString('ko-KR')}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/ads" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                광고 관리
              </Link>
              <Link href="/admin/news" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                뉴스 관리
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                사이트로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 실시간 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 광고</p>
                <p className="text-3xl font-bold text-blue-600">{formatNumber(stats.totalAds)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-blue-500 mr-1">📊</span>
                <span>전체 등록된 광고</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">승인 대기</p>
                <p className="text-3xl font-bold text-yellow-600">{formatNumber(stats.pendingAds)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-yellow-500 mr-1">⏳</span>
                <span>검토 필요</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 광고</p>
                <p className="text-3xl font-bold text-green-600">{formatNumber(stats.activeAds)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-1">✅</span>
                <span>현재 노출 중</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 수익</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-purple-500 mr-1">💰</span>
                <span>월 요금 합계</span>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">지역별 광고 분포</h2>
            <div className="space-y-3">
              {stats.regionStats.length > 0 ? (
                stats.regionStats.map((region, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                      }}></div>
                      <span className="text-sm font-medium text-gray-700">{region.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{region.count}개</span>
                      <span className="text-sm text-gray-400">({region.percentage}%)</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">지역별 데이터가 없습니다.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">최근 등록된 광고</h2>
            <div className="space-y-4">
              {stats.recentAds.length > 0 ? (
                stats.recentAds.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{ad.advertiser}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                          {getStatusText(ad.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{ad.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatDate(ad.created_at)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">등록된 광고가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">빠른 액션</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/admin/ads" 
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-blue-900">광고 관리</div>
                <div className="text-sm text-blue-600">광고 승인 및 관리</div>
              </div>
            </Link>

            <Link 
              href="/admin/news" 
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-green-900">뉴스 관리</div>
                <div className="text-sm text-green-600">뉴스 및 공지사항</div>
              </div>
            </Link>

            <button 
              onClick={fetchStats}
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-purple-900">새로고침</div>
                <div className="text-sm text-purple-600">통계 업데이트</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 