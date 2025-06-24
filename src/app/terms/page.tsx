export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <span className="text-gray-600 mr-2">📋</span>
            이용약관
          </h1>
          <p className="text-gray-600">커뮤니티 이용에 관한 약관입니다</p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제1조 (목적)</h2>
              <p>본 약관은 회생파산워크아웃 커뮤니티(이하 "사이트")의 이용조건 및 절차, 이용자와 사이트 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제2조 (정의)</h2>
              <div className="space-y-2">
                <p>1. "이용자"란 사이트에 접속하여 본 약관에 따라 사이트가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</p>
                <p>2. "회원"이란 사이트에 개인정보를 제공하여 회원등록을 한 자로서, 사이트의 정보를 지속적으로 제공받으며, 사이트가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</p>
                <p>3. "비회원"이란 회원에 가입하지 않고 사이트가 제공하는 서비스를 이용하는 자를 말합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
              <div className="space-y-2">
                <p>1. 본 약관은 사이트에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</p>
                <p>2. 사이트는 필요한 경우 관련법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</p>
                <p>3. 약관이 변경되는 경우, 변경사항의 시행일자 및 변경사유를 명시하여 현행약관과 함께 사이트의 초기화면에 그 시행일자 7일 이전부터 공지합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제4조 (서비스의 제공)</h2>
              <div className="space-y-2">
                <p>1. 사이트는 다음과 같은 서비스를 제공합니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>회생, 파산, 워크아웃 관련 정보 제공</li>
                  <li>익명 커뮤니티 서비스</li>
                  <li>관련 법무사/변호사 광고 서비스</li>
                </ul>
                <p>2. 서비스의 이용은 사이트의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제5조 (서비스의 중단)</h2>
              <div className="space-y-2">
                <p>1. 사이트는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
                <p>2. 사이트는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상하지 아니합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제6조 (이용자의 의무)</h2>
              <div className="space-y-2">
                <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>신청 또는 변경 시 허위내용의 등록</li>
                  <li>타인의 정보 도용</li>
                  <li>사이트에 게시된 정보의 변경</li>
                  <li>사이트가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                  <li>사이트 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                  <li>사이트 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                  <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 사이트에 공개 또는 게시하는 행위</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제7조 (개인정보보호)</h2>
              <div className="space-y-2">
                <p>1. 사이트는 이용자의 개인정보를 보호하기 위해 개인정보처리방침을 수립하고 이를 준수합니다.</p>
                <p>2. 이용자의 개인정보보호에 관한 상세한 내용은 개인정보처리방침에서 정합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제8조 (면책조항)</h2>
              <div className="space-y-2">
                <p>1. 사이트는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
                <p>2. 사이트는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                <p>3. 사이트는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제9조 (분쟁해결)</h2>
              <div className="space-y-2">
                <p>1. 사이트는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</p>
                <p>2. 사이트와 이용자 간에 발생한 전자상거래 분쟁에 관하여는 소비자분쟁조정위원회의 조정에 따를 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-3">제10조 (재판권 및 준거법)</h2>
              <div className="space-y-2">
                <p>1. 사이트와 이용자 간에 발생한 분쟁에 관하여는 대한민국 법을 적용합니다.</p>
                <p>2. 사이트와 이용자 간에 제기된 소송에는 대한민국 법원을 관할법원으로 합니다.</p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>부칙</strong><br />
                본 약관은 2024년 1월 1일부터 시행합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 