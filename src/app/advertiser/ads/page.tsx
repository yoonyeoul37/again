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
      case '진행중': return 'bg-green-100 text-green-800';
      case '대기중': return 'bg-yellow-100 text-yellow-800';
      case '종료': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad: any) => {
              const status = getStatusText(ad.start_date, ad.end_date);
              return (
                <div key={ad.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* 이미지 */}
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
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
                    <div className={`absolute inset-0 flex items-center justify-center ${ad.image_url ? 'hidden' : ''}`}>
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {/* 상태 배지 */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                  
                  {/* 내용 */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {ad.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {ad.description}
                    </p>
                    
                    {/* 광고주 정보 */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {ad.advertiser}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {ad.phone}
                      </div>
                    </div>
                    
                    {/* 계약 기간 */}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>계약 기간:</span>
                        <span>{formatDate(ad.start_date)} ~ {formatDate(ad.end_date)}</span>
                      </div>
                    </div>
                    
                    {/* 광고 타입 */}
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ad.ad_type === 'major' ? '대도시 전체' : '지역 선택'}
                      </span>
                    </div>
                    {/* 수정/삭제 버튼 */}
                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/advertiser/ads/edit/${ad.id}`}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium"
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
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 