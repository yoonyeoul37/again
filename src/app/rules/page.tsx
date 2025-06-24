export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            커뮤니티 이용수칙
          </h1>
          <p className="text-gray-600">건전하고 따뜻한 커뮤니티 문화를 함께 만들어주세요</p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          
          {/* 기본 수칙 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              기본 수칙
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">익명 작성</h3>
                <p className="text-gray-700 text-sm">익명으로 작성하되, 닉네임은 필수입니다.</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">상호 존중</h3>
                <p className="text-gray-700 text-sm">타인을 비방하거나 욕설을 사용하지 마세요.</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">개인정보 보호</h3>
                <p className="text-gray-700 text-sm">개인정보(연락처, 실명 등)는 절대 공개하지 마세요.</p>
              </div>
            </div>
          </div>

          {/* 전문가 상담 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              전문가 상담
            </h2>
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h3 className="font-semibold text-gray-900 mb-2">법률 자문</h3>
              <p className="text-gray-700 text-sm">법률 자문은 전문가에게 문의하세요. 커뮤니티의 정보는 참고용입니다.</p>
            </div>
          </div>

          {/* 금지 사항 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              금지 사항
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                <span className="text-gray-700 text-sm">상업적 광고, 홍보, 도배성 글은 금지됩니다.</span>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                <span className="text-gray-700 text-sm">운영진 판단에 따라 게시글/댓글이 삭제될 수 있습니다.</span>
              </div>
            </div>
          </div>

          {/* 커뮤니티 문화 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              커뮤니티 문화
            </h2>
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <h3 className="font-semibold text-gray-900 mb-2">함께 만들어가는 문화</h3>
              <p className="text-gray-700 text-sm">건전하고 따뜻한 커뮤니티 문화를 함께 만들어주세요. 서로의 고민을 나누고 위로하는 공간이 되길 바랍니다.</p>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">주의사항</h3>
            <p className="text-gray-700 text-sm">위 수칙을 위반할 경우 게시글/댓글이 사전 통보 없이 삭제될 수 있습니다.</p>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            더 궁금한 점이 있으시면 운영진에게 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
} 