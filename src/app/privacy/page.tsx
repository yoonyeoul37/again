export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <span className="text-gray-600 mr-2">🔒</span>
            개인정보처리방침
          </h1>
          <p className="text-gray-600">개인정보 보호에 관한 정책입니다</p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">1. 개인정보의 처리 목적</h2>
              <p>회생파산워크아웃 커뮤니티(이하 "사이트")는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.</p>
              <div className="mt-3 space-y-2">
                <p>• 회생, 파산, 워크아웃 관련 정보 제공</p>
                <p>• 커뮤니티 서비스 제공</p>
                <p>• 위치기반 광고 서비스 제공</p>
                <p>• 서비스 이용에 대한 통계 및 분석</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">2. 개인정보의 처리 및 보유기간</h2>
              <div className="space-y-3">
                <p>사이트는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 서비스 이용기록: 3년 (통신비밀보호법)</li>
                    <li>• 접속 로그: 3개월</li>
                    <li>• 위치정보: 서비스 이용 종료 시 즉시 삭제</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">3. 개인정보의 제3자 제공</h2>
              <div className="space-y-3">
                <p>사이트는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">제3자 제공 시 제공받는 자, 제공목적, 제공정보, 보유기간은 다음과 같습니다.</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 제공받는 자: 법무사/변호사 사무실</li>
                    <li>• 제공목적: 위치기반 광고 서비스</li>
                    <li>• 제공정보: 위치정보(구 단위)</li>
                    <li>• 보유기간: 서비스 이용 종료 시까지</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">4. 개인정보처리의 위탁</h2>
              <p>사이트는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <ul className="space-y-2 text-sm">
                  <li>• 위탁받는 자: 클라우드 서비스 제공업체</li>
                  <li>• 위탁하는 업무의 내용: 서버 호스팅 및 데이터 저장</li>
                  <li>• 위탁기간: 서비스 제공 기간</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">5. 정보주체의 권리·의무 및 그 행사방법</h2>
              <div className="space-y-3">
                <p>이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <ul className="space-y-2 text-sm">
                    <li>• 개인정보 열람요구</li>
                    <li>• 오류 등이 있을 경우 정정 요구</li>
                    <li>• 삭제요구</li>
                    <li>• 처리정지 요구</li>
                  </ul>
                </div>
                <p>제1항에 따른 권리 행사는 사이트에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 사이트는 이에 대해 지체없이 조치하겠습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">6. 처리하는 개인정보의 항목</h2>
              <p>사이트는 다음의 개인정보 항목을 처리하고 있습니다.</p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <ul className="space-y-2 text-sm">
                  <li>• 필수항목: 없음 (익명 서비스)</li>
                  <li>• 선택항목: 위치정보 (광고 서비스 이용 시)</li>
                  <li>• 자동수집항목: IP주소, 쿠키, 서비스 이용기록, 접속 로그</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">7. 개인정보의 파기</h2>
              <div className="space-y-3">
                <p>사이트는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">파기절차 및 방법은 다음과 같습니다.</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 파기절차: 불필요한 개인정보 및 개인정보파일은 개인정보보호책임자의 승인을 받아 파기</li>
                    <li>• 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">8. 개인정보의 안전성 확보 조치</h2>
              <p>사이트는 개인정보보호법 제29조에 따라 다음과 같은 안전성 확보 조치를 취하고 있습니다.</p>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <ul className="space-y-2 text-sm">
                  <li>• 개인정보의 암호화</li>
                  <li>• 해킹 등에 대비한 기술적 대책</li>
                  <li>• 개인정보에 대한 접근 제한</li>
                  <li>• 개인정보 취급 직원의 최소화 및 교육</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">9. 개인정보 보호책임자</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm">사이트는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                <div className="mt-3 space-y-1 text-sm">
                  <p>▶ 개인정보 보호책임자</p>
                  <p>• 성명: 개인정보보호책임자</p>
                  <p>• 직책: 관리자</p>
                  <p>• 연락처: privacy@example.com</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">10. 개인정보 처리방침 변경</h2>
              <p>이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
            </section>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>시행일자</strong><br />
                본 방침은 2024년 1월 1일부터 시행됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 