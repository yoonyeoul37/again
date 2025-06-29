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

// 메인 페이지 설정 타입
interface MainPageSettings {
  hopeImage: string;
  hopeMessage: string;
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
  const [mainPageSettings, setMainPageSettings] = useState<MainPageSettings>({
    hopeImage: '/globe.svg',
    hopeMessage: '희망은 언제나 가까이에 있습니다.\n함께 힘내요!'
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    fetchMainPageSettings();
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

  const saveMainPageSettings = async () => {
    setSavingSettings(true);
    try {
      // 먼저 테이블이 존재하는지 확인하고 없으면 생성
      const { error: tableError } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1);

      if (tableError && tableError.code === '42P01') {
        // 테이블이 없는 경우, RPC를 통해 테이블 생성 시도
        console.log('site_settings 테이블이 없습니다. 수동으로 생성해주세요.');
        alert('site_settings 테이블이 없습니다. Supabase에서 테이블을 생성한 후 다시 시도해주세요.');
        setSavingSettings(false);
        return;
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'main_page_hope',
          hope_image: mainPageSettings.hopeImage,
          hope_message: mainPageSettings.hopeMessage,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('설정 저장 실패:', error);
        alert('설정 저장 중 오류가 발생했습니다: ' + error.message);
      } else {
        alert('메인 페이지 설정이 저장되었습니다!');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      alert('업로드할 이미지를 선택해주세요.');
      return;
    }

    setUploadingImage(true);
    try {
      // 파일 크기 체크 (5MB 제한)
      if (imageFile.size > 5 * 1024 * 1024) {
        alert('이미지 파일 크기는 5MB 이하여야 합니다.');
        setUploadingImage(false);
        return;
      }

      // 파일 확장자 체크
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(imageFile.type)) {
        alert('지원되는 이미지 형식: JPG, PNG, GIF, WebP');
        setUploadingImage(false);
        return;
      }

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `hope-image-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('이미지 업로드 실패:', uploadError);
        alert('이미지 업로드 실패: ' + uploadError.message);
        setUploadingImage(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);

      setMainPageSettings(prev => ({ ...prev, hopeImage: urlData.publicUrl }));
      setImageFile(null);
      alert('이미지가 업로드되었습니다!');
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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
      {/* 메인 헤더 */}
      <header className="bg-gradient-to-r from-[#333333] to-[#444444] shadow-md sticky top-0 z-50" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center shadow rounded-full">
                {/* 말풍선(채팅) SVG 아이콘 */}
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.09-3.27C3.4 15.1 3 13.59 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight drop-shadow">
                개인회생119<span className="text-green-200 font-extrabold text-sm">개인법인회생파산 정보공유</span>
              </span>
            </Link>

            {/* 관리자 메뉴 */}
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <span className="text-white bg-red-500 px-3 py-1 rounded-full font-bold">관리자</span>
              <Link href="/admin/ads" className="text-white/80 hover:text-white font-semibold transition-colors">
                광고 관리
              </Link>
              <Link href="/admin/ads/banner" className="text-white/80 hover:text-white font-semibold transition-colors">
                개인광고
              </Link>
              <Link href="/admin/news" className="text-white/80 hover:text-white font-semibold transition-colors">
                뉴스 관리
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* 서브 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-bold text-gray-900">관리자 대시보드</h1>
              {mounted && (
                <span className="text-xs text-gray-500">
                  {currentTime.toLocaleString('ko-KR')}
                </span>
              )}
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
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
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

        {/* 메인 페이지 설정 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">메인 페이지 설정</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">희망 메시지 이미지</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={mainPageSettings.hopeImage} 
                    alt="현재 이미지" 
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = '/globe.svg';
                    }}
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={mainPageSettings.hopeImage}
                      onChange={(e) => setMainPageSettings(prev => ({ ...prev, hopeImage: e.target.value }))}
                      placeholder="/your-image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      이미지 파일을 public 폴더에 넣고 경로를 입력하거나, 아래에서 파일을 업로드하세요
                    </p>
                  </div>
                </div>
                
                {/* 파일 업로드 섹션 */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">파일 업로드</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleImageUpload}
                        disabled={!imageFile || uploadingImage}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {uploadingImage ? '업로드 중...' : '업로드'}
                      </button>
                    </div>
                    {imageFile && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>선택된 파일:</span>
                        <span className="font-medium">{imageFile.name}</span>
                        <span className="text-gray-400">({(imageFile.size / 1024 / 1024).toFixed(2)}MB)</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      지원 형식: JPG, PNG, GIF, WebP (최대 5MB) • GIF 파일도 업로드 가능합니다!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-3">희망 메시지</h3>
              <div className="space-y-4">
                <textarea
                  value={mainPageSettings.hopeMessage}
                  onChange={(e) => setMainPageSettings(prev => ({ ...prev, hopeMessage: e.target.value }))}
                  placeholder="희망 메시지를 입력하세요..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500">
                  줄바꿈은 \n으로 표시됩니다. 예: "희망은 언제나 가까이에 있습니다.\n함께 힘내요!"
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={saveMainPageSettings}
              disabled={savingSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingSettings ? '저장 중...' : '설정 저장'}
            </button>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">미리보기</h4>
            <div className="bg-white rounded-lg p-4 border border-gray-200 max-w-xs">
              <img 
                src={mainPageSettings.hopeImage} 
                alt="희망 이미지" 
                className="w-16 h-16 mx-auto mb-3 opacity-80"
                onError={(e) => {
                  e.currentTarget.src = '/globe.svg';
                }}
              />
              <p className="text-xs text-gray-500 text-center whitespace-pre-line">
                {mainPageSettings.hopeMessage}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 