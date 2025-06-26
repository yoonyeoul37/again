'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

// 광고 데이터 타입
interface AdData {
  id: string;
  advertiser_id: string;
  advertiser: string;
  phone: string;
  email: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  ad_type: 'major' | 'regional';
  major_city: string | null;
  regions: string[] | null;
  image_url: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export default function AdminAdsPage() {
  const { user, isLoading } = useAuth();
  const [ads, setAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [updatingAd, setUpdatingAd] = useState<string | null>(null);

  // 광고 데이터 가져오기
  useEffect(() => {
    if (!user) return;
    fetchAds();
  }, [user]);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('광고 데이터 가져오기 실패:', error);
        alert('광고 데이터를 불러오는데 실패했습니다.');
      } else {
        setAds(data || []);
      }
    } catch (error) {
      console.error('광고 데이터 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 광고 상태 업데이트
  const updateAdStatus = async (adId: string, newStatus: string) => {
    setUpdatingAd(adId);
    try {
      const { error } = await supabase
        .from('ads')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', adId);

      if (error) {
        console.error('광고 상태 업데이트 실패:', error);
        alert('광고 상태 업데이트에 실패했습니다.');
      } else {
        // 로컬 상태 업데이트
        setAds(prev => prev.map(ad => 
          ad.id === adId ? { ...ad, status: newStatus as any, updated_at: new Date().toISOString() } : ad
        ));
        alert('광고 상태가 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('광고 상태 업데이트 오류:', error);
      alert('광고 상태 업데이트 중 오류가 발생했습니다.');
    } finally {
      setUpdatingAd(null);
    }
  };

  // 광고 삭제
  const deleteAd = async (adId: string) => {
    if (!window.confirm('정말 이 광고를 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', adId);

      if (error) {
        console.error('광고 삭제 실패:', error);
        alert('광고 삭제에 실패했습니다.');
      } else {
        setAds(prev => prev.filter(ad => ad.id !== adId));
        alert('광고가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('광고 삭제 오류:', error);
      alert('광고 삭제 중 오류가 발생했습니다.');
    }
  };

  // 지역 카테고리 목록
  const regionCategories = [
    { value: 'all', label: '전체 지역' },
    { value: 'seoul', label: '서울' },
    { value: 'busan', label: '부산' },
    { value: 'daegu', label: '대구' },
    { value: 'incheon', label: '인천' },
    { value: 'daejeon', label: '대전' },
    { value: 'gwangju', label: '광주' },
    { value: 'ulsan', label: '울산' },
    { value: 'sejong', label: '세종' },
    { value: 'gyeonggi', label: '경기도' },
    { value: 'gangwon', label: '강원도' },
    { value: 'chungbuk', label: '충청북도' },
    { value: 'chungnam', label: '충청남도' },
    { value: 'jeonbuk', label: '전라북도' },
    { value: 'jeonnam', label: '전라남도' },
    { value: 'gyeongbuk', label: '경상북도' },
    { value: 'gyeongnam', label: '경상남도' },
    { value: 'jeju', label: '제주도' }
  ];

  const filteredAds = ads.filter(ad => {
    const matchesStatus = selectedStatus === 'all' || ad.status === selectedStatus;
    const matchesRegion = selectedRegion === 'all' || 
      (ad.ad_type === 'major' && ad.major_city?.includes(selectedRegion)) ||
      (ad.ad_type === 'regional' && ad.regions?.some(r => r.includes(selectedRegion)));
    const matchesSearch = ad.advertiser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesRegion && matchesSearch;
  });

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getRegionText = (ad: AdData) => {
    if (ad.ad_type === 'major') {
      const majorCities: { [key: string]: string } = {
        'seoul': '서울 전체 (25개 구)',
        'busan': '부산 전체 (16개 구/군)',
        'daegu': '대구 전체 (8개 구/군)',
        'incheon': '인천 전체 (10개 구/군)',
        'daejeon': '대전 전체 (5개 구)',
        'gwangju': '광주 전체 (5개 구)',
        'ulsan': '울산 전체 (5개 구/군)',
        'sejong': '세종특별자치시'
      };
      return majorCities[ad.major_city || ''] || ad.major_city;
    } else {
      return ad.regions?.join(', ') || '지역 미선택';
    }
  };

  // 가격 계산 (광고주 페이지와 동일한 로직)
  const calculatePrice = (ad: AdData) => {
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
      return majorCityPrices[ad.major_city || ''] || 0;
    } else {
      // 중소도시/군은 55,000원
      return 55000;
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
              <h1 className="text-2xl font-bold text-gray-900">광고 관리</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/ads/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                새 광고 등록
              </Link>
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                대시보드로
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 광고</p>
                <p className="text-3xl font-bold text-blue-600">{ads.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">승인 대기</p>
                <p className="text-3xl font-bold text-yellow-600">{ads.filter(ad => ad.status === 'pending').length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 광고</p>
                <p className="text-3xl font-bold text-green-600">{ads.filter(ad => ad.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 수익</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(ads.reduce((sum, ad) => sum + calculatePrice(ad), 0))}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 상태</option>
                <option value="pending">대기중</option>
                <option value="approved">승인됨</option>
                <option value="rejected">거부됨</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {regionCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="광고주명, 제목, 이메일"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAds}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>

        {/* 광고 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">광고 목록 ({filteredAds.length}개)</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">광고 데이터를 불러오는 중...</p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              조건에 맞는 광고가 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      광고주 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      지역
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      광고 내용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      계약 기간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      월 요금
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAds.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ad.advertiser}</div>
                          <div className="text-sm text-gray-500">{ad.phone}</div>
                          <div className="text-sm text-gray-500">{ad.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{getRegionText(ad)}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          {ad.ad_type === 'major' ? '대도시 전체' : '중소도시/군 선택'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          <div className="text-sm text-gray-500">{ad.description}</div>
                          {ad.image_url && (
                            <div className="mt-2">
                              <img 
                                src={ad.image_url} 
                                alt="광고 이미지" 
                                className="w-16 h-12 object-cover rounded border"
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                          {getStatusText(ad.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{formatDate(ad.start_date)} ~ {formatDate(ad.end_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(calculatePrice(ad))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="space-y-2">
                          {ad.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateAdStatus(ad.id, 'approved')}
                                disabled={updatingAd === ad.id}
                                className="block w-full px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                {updatingAd === ad.id ? '처리중...' : '승인'}
                              </button>
                              <button
                                onClick={() => updateAdStatus(ad.id, 'rejected')}
                                disabled={updatingAd === ad.id}
                                className="block w-full px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                {updatingAd === ad.id ? '처리중...' : '거부'}
                              </button>
                            </>
                          )}
                          {ad.status === 'approved' && (
                            <button
                              onClick={() => updateAdStatus(ad.id, 'active')}
                              disabled={updatingAd === ad.id}
                              className="block w-full px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              {updatingAd === ad.id ? '처리중...' : '활성화'}
                            </button>
                          )}
                          {ad.status === 'active' && (
                            <button
                              onClick={() => updateAdStatus(ad.id, 'inactive')}
                              disabled={updatingAd === ad.id}
                              className="block w-full px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 disabled:opacity-50"
                            >
                              {updatingAd === ad.id ? '처리중...' : '비활성화'}
                            </button>
                          )}
                          {ad.status === 'inactive' && (
                            <button
                              onClick={() => updateAdStatus(ad.id, 'active')}
                              disabled={updatingAd === ad.id}
                              className="block w-full px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              {updatingAd === ad.id ? '처리중...' : '활성화'}
                            </button>
                          )}
                          <button
                            onClick={() => deleteAd(ad.id)}
                            className="block w-full px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 