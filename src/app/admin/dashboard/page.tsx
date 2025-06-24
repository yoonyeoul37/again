'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// 샘플 데이터 (실제로는 API에서 가져옴)
const sampleStats = {
  realTime: {
    visitors: 127,
    activeUsers: 89,
    pageViews: 342
  },
  monthly: {
    visitors: 15420,
    pageViews: 45678,
    uniqueVisitors: 12340
  },
  ads: {
    impressions: 89234,
    clicks: 1234,
    ctr: 1.38,
    revenue: 1250000 // 공급가액 (부가세 제외)
  },
  regions: [
    { name: '서울', visitors: 8234, percentage: 53.4 },
    { name: '경기', visitors: 3456, percentage: 22.4 },
    { name: '부산', visitors: 1234, percentage: 8.0 },
    { name: '대구', visitors: 987, percentage: 6.4 },
    { name: '인천', visitors: 876, percentage: 5.7 },
    { name: '기타', visitors: 633, percentage: 4.1 }
  ],
  topPosts: [
    { id: '1', title: '개인회생 신청 절차 문의', views: 1234, comments: 45 },
    { id: '2', title: '파산 vs 개인회생 차이점', views: 987, comments: 32 },
    { id: '3', title: '이혼 재산분할 상담', views: 876, comments: 28 },
    { id: '4', title: '워크아웃 신청 방법', views: 765, comments: 23 },
    { id: '5', title: '부채 상환 계획 수립', views: 654, comments: 19 }
  ],
  recentInquiries: [
    { id: '1', advertiser: '강남법무사', region: '서울 강남구', date: '2024-01-15', status: '승인' },
    { id: '2', advertiser: '송파변호사', region: '서울 송파구', date: '2024-01-14', status: '검토중' },
    { id: '3', advertiser: '부산법무사', region: '부산 해운대구', date: '2024-01-13', status: '승인' },
    { id: '4', advertiser: '대구변호사', region: '대구 수성구', date: '2024-01-12', status: '반려' },
    { id: '5', advertiser: '인천법무사', region: '인천 연수구', date: '2024-01-11', status: '승인' }
  ]
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(sampleStats);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

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
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                사용자 관리
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">실시간 방문자</p>
                <p className="text-3xl font-bold text-blue-600">{formatNumber(stats.realTime.visitors)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-1">↗</span>
                <span>활성 사용자: {formatNumber(stats.realTime.activeUsers)}명</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">월간 방문자</p>
                <p className="text-3xl font-bold text-green-600">{formatNumber(stats.monthly.visitors)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-1">↗</span>
                <span>페이지뷰: {formatNumber(stats.monthly.pageViews)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">월 광고 수익</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(stats.ads.revenue)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-1">↗</span>
                <span>CTR: {stats.ads.ctr}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 광고 성과 상세 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">광고 성과</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 노출 수</span>
                <span className="font-semibold">{formatNumber(stats.ads.impressions)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 클릭 수</span>
                <span className="font-semibold">{formatNumber(stats.ads.clicks)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">클릭률 (CTR)</span>
                <span className="font-semibold text-blue-600">{stats.ads.ctr}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">총 수익</span>
                <span className="font-semibold text-green-600">{formatCurrency(stats.ads.revenue)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">지역별 방문자</h2>
            <div className="space-y-3">
              {stats.regions.map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}></div>
                    <span className="text-gray-700">{region.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{formatNumber(region.visitors)}</span>
                    <span className="text-sm text-gray-400">({region.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 인기 게시글 & 최근 광고 문의 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">인기 게시글</h2>
            <div className="space-y-3">
              {stats.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>👁️ {formatNumber(post.views)}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  </div>
                  <Link href={`/post/${post.id}`} className="text-blue-600 hover:text-blue-700 text-xs">
                    보기
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">최근 광고 문의</h2>
            <div className="space-y-3">
              {stats.recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{inquiry.advertiser}</h3>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{inquiry.region}</span>
                      <span>{inquiry.date}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    inquiry.status === '승인' ? 'bg-green-100 text-green-800' :
                    inquiry.status === '검토중' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {inquiry.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 빠른 액션 버튼 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">빠른 액션</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/ads/new" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium text-blue-900">새 광고 등록</span>
            </Link>
            <Link href="/admin/reports" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium text-green-900">리포트 생성</span>
            </Link>
            <Link href="/admin/settings" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-purple-900">설정</span>
            </Link>
            <Link href="/admin/support" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
              <span className="text-sm font-medium text-orange-900">고객 지원</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 