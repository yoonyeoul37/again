import Link from 'next/link';

export default function CreditRecoveryPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          신용회복위원회
        </h1>
        
        {/* 소개 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">신용회복위원회란?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            신용회복위원회는 금융감독원 산하의 정부 기관으로, 개인 채무자의 신용회복을 위한 
            무료 상담 및 채무조정 서비스를 제공합니다. 법원 개입 없이 채권자와 채무자 간의 
            합의를 도와주는 중재 역할을 합니다.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-blue-800 font-medium">
              💡 <strong>무료 서비스</strong> - 신용회복위원회의 모든 상담과 조정 서비스는 무료로 제공됩니다.
            </p>
          </div>
        </div>

        {/* 주요 서비스 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">주요 서비스</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📞 무료 채무상담</h3>
              <p className="text-gray-700 text-sm">
                전화, 온라인, 방문을 통한 무료 채무상담 서비스
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🤝 채무조정 중재</h3>
              <p className="text-gray-700 text-sm">
                채권자와 채무자 간의 합의를 위한 중재 서비스
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📋 상환계획 수립</h3>
              <p className="text-gray-700 text-sm">
                개인 상황에 맞는 맞춤형 상환계획 수립 지원
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🎯 신용회복 지원</h3>
              <p className="text-gray-700 text-sm">
                채무조정 완료 후 신용회복을 위한 지속적 지원
              </p>
            </div>
          </div>
        </div>

        {/* 신청 절차 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">신청 절차</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">상담 신청</h3>
                <p className="text-gray-700 text-sm">전화, 온라인, 또는 방문을 통해 상담 신청</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">서류 제출</h3>
                <p className="text-gray-700 text-sm">소득증빙서류, 채무내역서 등 필요서류 제출</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">상환계획 수립</h3>
                <p className="text-gray-700 text-sm">개인 상황에 맞는 상환계획 수립</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">채권자 협의</h3>
                <p className="text-gray-700 text-sm">채권자와의 협의를 통한 채무조정 진행</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">상환 시작</h3>
                <p className="text-gray-700 text-sm">합의된 조건에 따라 상환 시작</p>
              </div>
            </div>
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">연락처 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">📞 전화 상담</h3>
              <p className="text-blue-600 font-semibold text-lg">1397</p>
              <p className="text-gray-600 text-sm">평일 09:00 ~ 18:00</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🌐 온라인 상담</h3>
              <a 
                href="https://www.credit.or.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                www.credit.or.kr
              </a>
              <p className="text-gray-600 text-sm">24시간 접속 가능</p>
            </div>
          </div>
        </div>

        {/* 워크아웃과의 차이점 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">워크아웃과의 차이점</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">구분</th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">신용회복위원회</th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold text-gray-900">워크아웃</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 text-sm font-medium">주체</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">정부 기관</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">민간 협의</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 text-sm font-medium">비용</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">무료</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">유료</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 text-sm font-medium">법적 구속력</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">약함</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">강함</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2 text-sm font-medium">적용 대상</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">주로 개인</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-700">개인/법인 모두</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 관련 링크 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">관련 서비스</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/consultation" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">📋 상담 신청</h3>
              <p className="text-gray-700 text-sm">전문가와 1:1 상담을 받아보세요</p>
            </Link>
            <Link 
              href="/news" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 mb-2">📰 관련 뉴스</h3>
              <p className="text-gray-700 text-sm">최신 회생·파산 관련 뉴스를 확인하세요</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 