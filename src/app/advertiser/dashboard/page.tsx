"use client";
import Link from 'next/link';

export default function AdvertiserDashboard() {
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
                신복이! <span className="text-green-200 font-extrabold text-sm">개인법인회생파산 정보공유</span>
              </span>
            </Link>

            {/* 광고주 메뉴 */}
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <span className="text-white bg-blue-500 px-3 py-1 rounded-full font-bold">광고주</span>
              <Link href="/advertiser/ads" className="text-white/80 hover:text-white font-semibold transition-colors">
                내 광고
              </Link>
              <Link href="/advertiser/ads/new" className="text-white/80 hover:text-white font-semibold transition-colors">
                광고 등록
              </Link>
              <Link href="/advertiser/stats" className="text-white/80 hover:text-white font-semibold transition-colors">
                통계
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">광고주 대시보드</h1>
            <p className="text-gray-600">광고를 관리하고 통계를 확인하세요</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              href="/advertiser/ads"
              className="group block p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">내 광고 목록</h3>
                <p className="text-sm text-gray-600">등록한 광고들을 확인하고 관리하세요</p>
              </div>
            </Link>

            <Link
              href="/advertiser/ads/new"
              className="group block p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">새 광고 등록</h3>
                <p className="text-sm text-gray-600">새로운 광고를 등록하여 홍보하세요</p>
              </div>
            </Link>

            <Link
              href="/advertiser/stats"
              className="group block p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 hover:shadow-md"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">광고 통계</h3>
                <p className="text-sm text-gray-600">광고 성과와 통계를 분석하세요</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 