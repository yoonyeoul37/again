import Link from 'next/link';

export default function AdvertisingPage() {
  return (
    <div className="min-h-screen bg-white py-12" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded mb-6">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-[#333] mb-4">
            법무사/변호사 광고 서비스
          </h1>
          <p className="text-xl text-[#666] max-w-3xl mx-auto leading-relaxed">
            회생파산워크아웃 커뮤니티를 통해 정확한 타겟 고객에게 직접적으로 광고를 노출하세요. 위치기반 타겟팅으로 높은 전환율을 경험하실 수 있습니다.
          </p>
        </div>

        {/* 광고 이미지 등록 가이드라인 */}
        <div className="mb-10 p-6 bg-blue-50 border border-blue-200 rounded-xl text-[#222] text-base shadow-sm">
          <strong className="block text-lg text-blue-700 mb-2">[광고 이미지 등록 안내]</strong>
          <ul className="list-disc pl-5 space-y-1">
            <li>권장 사이즈: <span className="font-semibold">728 x 90px (가로 배너)</span></li>
            <li>파일 형식: JPG, PNG</li>
            <li>파일 크기: 1MB 이하</li>
            <li>배너는 <span className="font-semibold">가로로 긴 형태(728x90px)</span>로 제작해 주세요.</li>
            <li className="text-red-500">권장 사이즈와 다를 경우, 이미지가 잘리거나 빈 공간이 생길 수 있습니다.</li>
          </ul>
        </div>

        {/* 통계 섹션 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded border border-gray-200 p-8 text-center">
            <div className="text-3xl font-bold text-[#333] mb-2">15,000+</div>
            <div className="text-[#666] font-medium">월간 방문자</div>
            <div className="text-sm text-[#999] mt-1">부채 문제 고민자</div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-8 text-center">
            <div className="text-3xl font-bold text-[#333] mb-2">85%</div>
            <div className="text-[#666] font-medium">타겟 정확도</div>
            <div className="text-sm text-[#999] mt-1">실제 상담 문의율</div>
          </div>
          <div className="bg-white rounded border border-gray-200 p-8 text-center">
            <div className="text-3xl font-bold text-[#333] mb-2">24시간</div>
            <div className="text-[#666] font-medium">광고 노출</div>
            <div className="text-sm text-[#999] mt-1">연중무휴 서비스</div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 왼쪽: 서비스 특징 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 서비스 특징 */}
            <div className="bg-white rounded border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#333] mb-6 flex items-center">
                <svg className="w-6 h-6 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                서비스 특징
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#333] mb-2">서울 전체 지역 광고</h3>
                    <p className="text-[#666] text-sm leading-relaxed">
                      서울 25개 구 전체에서 사용자에게 광고가 노출됩니다. 더 많은 노출 기회를 제공합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#333] mb-2">높은 전환율</h3>
                    <p className="text-[#666] text-sm leading-relaxed">
                      부채 문제로 고민하는 고객들에게 직접적으로 광고가 노출되어 상담 문의율이 높습니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#333] mb-2">모바일 최적화</h3>
                    <p className="text-[#666] text-sm leading-relaxed">
                      PC, 모바일 모든 기기에서 최적화된 광고가 표시되어 접근성이 뛰어납니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#333] mb-2">실시간 통계</h3>
                    <p className="text-[#666] text-sm leading-relaxed">
                      광고 노출 수, 클릭 수, 문의 수 등 상세한 통계를 실시간으로 확인할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 광고 위치 */}
            <div className="bg-white rounded border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#333] mb-6 flex items-center">
                <svg className="w-6 h-6 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                광고 노출 위치
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-[#333] mb-4 text-lg">메인 페이지</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-[#666]">리스트 상단 배너 (728x90)</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-[#666]">리스트 하단 배너 (728x90)</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-[#666]">사이드바 광고 (300x250)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[#333] mb-4 text-lg">게시글 상세</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-[#666]">게시글 하단 배너 (728x90)</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-[#666]">댓글 하단 배너 (728x90)</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-[#666]">사이드바 광고 (300x250)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 사이드바 */}
          <div className="space-y-6">
            {/* 광고 비용 */}
            <div className="bg-white rounded border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-[#333] mb-4 flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                광고 비용
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="text-sm text-[#666] font-medium mb-1">서울 전체</div>
                  <div className="text-2xl font-bold text-[#333]">월 110,000원</div>
                  <div className="text-xs text-[#999] mt-1">
                    부가세 포함
                  </div>
                  <div className="text-xs text-[#999]">서울 25개 구 전체 노출</div>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="text-sm text-[#666] font-medium mb-1">기타 시</div>
                  <div className="text-2xl font-bold text-[#333]">월 88,000원</div>
                  <div className="text-xs text-[#999] mt-1">
                    부가세 포함
                  </div>
                  <div className="text-xs text-[#999]">부산, 대구, 인천 등</div>
                </div>
                <div className="p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="text-sm text-[#666] font-medium mb-1">군 지역</div>
                  <div className="text-2xl font-bold text-[#333]">월 55,000원</div>
                  <div className="text-xs text-[#999] mt-1">
                    부가세 포함
                  </div>
                  <div className="text-xs text-[#999]">기타 군 지역</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs text-[#999]">
                  <strong>※</strong> 정확한 비용은 지역별 수요에 따라 조정될 수 있습니다.
                </p>
                <p className="text-xs text-[#999] mt-1">
                  <strong>※</strong> 모든 금액은 부가세(10%) 포함 금액입니다.
                </p>
              </div>
            </div>

            {/* 문의 방법 */}
            <div className="bg-white rounded border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-[#333] mb-4 flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                문의 방법
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[#333]">이메일 문의</div>
                  <div className="text-sm text-[#666]">advertising@example.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[#333]">전화 문의</div>
                  <div className="text-sm text-[#666]">02-1234-5678</div>
                </div>
              </div>
            </div>

            {/* 신뢰도 */}
            <div className="bg-white rounded border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-[#333] mb-4 flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                신뢰도
              </h3>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-[#666]">SSL 보안 인증</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-[#666]">개인정보보호법 준수</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-[#666]">24시간 모니터링</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-[#666]">전문 고객 지원</span>
              </div>
            </div>

            {/* 광고 통계 및 사이트 이동 */}
            <div className="flex items-center space-x-4">
              <Link href="/advertiser/stats" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                광고 통계
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                사이트로 이동
              </Link>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="mt-16 bg-gray-100 rounded-xl shadow p-8 text-center text-[#333]">
          <h2 className="text-3xl font-bold mb-4">지금 바로 광고를 시작하세요</h2>
          <p className="text-xl mb-8 opacity-90">
            부채 문제로 고민하는 고객들에게 직접적으로 다가가세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:advertising@example.com?subject=광고 문의"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#333] font-semibold rounded hover:bg-gray-200 transition-colors border border-gray-300"
            >
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              이메일로 문의하기
            </a>
            <a 
              href="tel:02-1234-5678"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#333] font-semibold rounded hover:bg-gray-200 transition-colors border border-gray-300"
            >
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              전화로 문의하기
            </a>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="flex items-start space-x-3 mt-8">
          <svg className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="font-semibold text-[#333] mb-2">주의사항</h3>
            <ul className="text-[#999] text-sm space-y-1">
              <li>• 광고는 법무사/변호사 사무실만 등록 가능합니다</li>
              <li>• 허위 정보나 부적절한 내용은 제재 대상이 될 수 있습니다</li>
              <li>• 광고 내용은 사전 검토 후 승인됩니다</li>
              <li>• 계약 기간은 최소 1개월부터 시작됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 