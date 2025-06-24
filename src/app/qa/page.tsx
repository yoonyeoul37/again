import React from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

const qaList = [
  {
    question: '개인회생 시 준비절차는 어떻게 되나요?',
    answer: [
      {
        title: '부채 및 소득 현황 파악',
        desc: '신용정보원(credit4u.or.kr)에서 신용정보조회로 모든 금융권 채무내역을 확인하고, 소득증빙자료를 준비합니다.'
      },
      {
        title: '관할 법원 확인',
        desc: '주민등록상 주소지 기준으로 관할 지방법원을 확인합니다. (예: 서울 거주자는 서울회생법원)'
      },
      {
        title: '필수 서류 준비',
        desc: '주민등록등본, 가족관계증명서, 소득증빙, 부채증빙, 재산증빙, 임대차계약서, 통장사본 등을 준비합니다.'
      },
      {
        title: '개인회생 신청서 작성',
        desc: '법원 홈페이지에서 최신 양식을 내려받아 작성합니다. 변제계획안은 월 소득, 생계비, 변제금 산정 등 구체적으로 기입해야 합니다.'
      },
      {
        title: '법원 접수 및 심사',
        desc: '준비한 서류와 신청서를 관할 법원에 직접 방문 또는 우편으로 접수합니다. 접수 후 보정명령이 올 수 있으니 문자/우편을 수시로 확인하세요.'
      },
      {
        title: '인가 결정 및 변제금 납부',
        desc: '법원 심사 후 인가결정이 나면, 법원에서 지정한 계좌로 매월 변제금을 납부합니다. 변제기간(3~5년) 동안 성실히 납부하면 남은 부채가 면제됩니다.'
      },
    ],
  },
  {
    question: '개인파산 시 준비절차는 어떻게 되나요?',
    answer: [
      {
        title: '부채 및 자산 현황 파악',
        desc: '신용정보원에서 채무내역을 확인하고, 본인 명의의 부동산, 차량, 예금 등 자산을 모두 목록화합니다.'
      },
      {
        title: '관할 법원 확인',
        desc: '주민등록상 주소지 기준 지방법원(파산부)에 신청합니다.'
      },
      {
        title: '필수 서류 준비',
        desc: '주민등록등본, 가족관계증명서, 신용정보원 채무내역, 금융기관 채무증명서, 재산증빙, 소득증빙, 임대차계약서, 통장사본 등을 준비합니다.'
      },
      {
        title: '파산 및 면책 신청서 작성',
        desc: '법원 홈페이지에서 양식을 내려받아 작성합니다. 파산신청서에는 부채, 자산, 소득, 가족사항, 파산 사유 등을 구체적으로 기재해야 합니다.'
      },
      {
        title: '법원 접수 및 심사',
        desc: '관할 법원에 서류를 접수하고, 파산관재인 선임 및 심문(필요시)이 진행됩니다. 추가 서류 보정 요청이 있을 수 있으니 문자/우편을 확인하세요.'
      },
      {
        title: '면책 결정',
        desc: '법원 심사 후 면책이 확정되면 모든 부채가 소멸됩니다. 이후 신용회복 절차를 진행할 수 있습니다.'
      },
    ],
  },
  {
    question: '법인회생 시 준비절차는 어떻게 되나요?',
    answer: [
      {
        title: '회사 재무상태 및 부채 현황 파악',
        desc: '최근 3년 재무제표, 부채목록, 채권자 명단, 자산목록 등 회사의 모든 재무자료를 준비합니다.'
      },
      {
        title: '이사회/주주총회 결의',
        desc: '회생절차 개시를 위한 이사회 또는 주주총회 결의서(의사록)를 작성합니다.'
      },
      {
        title: '관할 법원 확인',
        desc: '회사 본점 소재지 기준 관할 지방법원(회생부)에 신청합니다.'
      },
      {
        title: '필수 서류 준비',
        desc: '회생절차 개시신청서, 회생계획안, 재무제표, 부채목록, 채권자 명단, 자산목록, 사업자등록증, 법인등기부등본, 주주명부, 이사회/주주총회 의사록 등을 준비합니다.'
      },
      {
        title: '법원 접수 및 심사',
        desc: '관할 법원에 서류를 접수하고, 보정명령(서류 보완 요청)이 있을 수 있으니 수시로 확인합니다.'
      },
      {
        title: '회생계획안 작성 및 인가',
        desc: '법원에서 요구하는 기준에 맞춰 회생계획안을 작성, 제출하고, 인가결정이 나면 계획에 따라 채무를 변제합니다.'
      },
    ],
  },
  {
    question: '법인파산 시 준비절차는 어떻게 되나요?',
    answer: [
      {
        title: '회사 자산 및 부채 현황 파악',
        desc: '회사 명의의 부동산, 차량, 예금, 재고 등 자산과 모든 부채를 목록화합니다.'
      },
      {
        title: '이사회/주주총회 결의',
        desc: '파산신청을 위한 이사회 또는 주주총회 결의서(의사록)를 작성합니다.'
      },
      {
        title: '관할 법원 확인',
        desc: '회사 본점 소재지 기준 관할 지방법원(파산부)에 신청합니다.'
      },
      {
        title: '필수 서류 준비',
        desc: '파산신청서, 재무제표, 부채목록, 채권자 명단, 자산목록, 사업자등록증, 법인등기부등본, 주주명부, 이사회/주주총회 의사록 등을 준비합니다.'
      },
      {
        title: '법원 접수 및 심사',
        desc: '관할 법원에 서류를 접수하고, 파산관재인 선임 및 심사, 추가 서류 보정 요청이 있을 수 있으니 수시로 확인합니다.'
      },
      {
        title: '파산 종결 및 청산',
        desc: '법원 심사 후 파산 종결 결정이 내려지면 회사 자산을 청산하고 법인 등기 말소 등 후속 절차를 진행합니다.'
      },
    ],
  },
  {
    question: '워크아웃 시 준비절차는 어떻게 되나요?',
    answer: [
      {
        title: '신용회복위원회 상담 신청',
        desc: '신용회복위원회(ccrs.or.kr) 홈페이지 또는 전화(1600-5500)로 상담을 신청합니다.'
      },
      {
        title: '부채 및 소득 현황 파악',
        desc: '신용정보원에서 채무내역을 확인하고, 최근 3~6개월 급여명세서, 소득금액증명원 등 소득증빙자료를 준비합니다.'
      },
      {
        title: '필수 서류 준비',
        desc: '신분증, 소득증빙, 채무내역, 가족관계증명서, 통장사본 등을 준비합니다.'
      },
      {
        title: '채권자와 협의 및 조정안 작성',
        desc: '신용회복위원회 상담을 통해 채권자와 상환조건, 이자감면, 상환기간 등을 협의하고, 조정안을 작성합니다.'
      },
      {
        title: '상환계획 확정 및 이행',
        desc: '조정안이 확정되면, 상환계획에 따라 매월 변제금을 납부합니다. 성실히 이행하면 신용회복에 도움이 됩니다.'
      },
    ],
  },
  {
    question: '신용회복위원회는 무엇이고 어떤 서비스를 제공하나요?',
    answer: [
      {
        title: '신용회복위원회란?',
        desc: '신용회복위원회는 금융감독원 산하의 정부 기관으로, 개인 채무자의 신용회복을 위한 무료 상담 및 채무조정 서비스를 제공합니다. 법원 개입 없이 채권자와 채무자 간의 합의를 도와주는 중재 역할을 합니다.'
      },
      {
        title: '주요 서비스',
        desc: '무료 채무상담, 채무조정 중재, 상환계획 수립, 신용회복 지원 등을 제공합니다. 모든 서비스는 무료로 이용할 수 있습니다.'
      },
      {
        title: '연락처 정보',
        desc: '전화: 1397 (평일 09:00~18:00), 온라인: www.credit.or.kr (24시간 접속 가능)'
      },
      {
        title: '신청 절차',
        desc: '1) 상담 신청 → 2) 서류 제출 → 3) 상환계획 수립 → 4) 채권자 협의 → 5) 상환 시작'
      },
      {
        title: '워크아웃과의 차이점',
        desc: '신용회복위원회는 정부 기관으로 무료 서비스이며 법적 구속력이 약하고, 워크아웃은 민간 협의로 유료이며 법적 구속력이 강합니다.'
      },
    ],
  },
];

export default function QAPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Q/A - 준비절차 묻고 답하기
        </h1>
        
        <div className="space-y-6">
          {qaList.map((qa, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* 질문 */}
              <div className="bg-blue-600 px-6 py-4">
                <h2 className="text-white font-semibold text-lg">
                  Q. {qa.question}
                </h2>
              </div>
              
              {/* 답변 */}
              <div className="p-6">
                <div className="space-y-4">
                  {qa.answer.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{a.title}</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 상담 배너 */}
        <div className="mt-8 bg-blue-600 rounded-lg p-6 text-center text-white">
          <h3 className="text-lg font-semibold mb-2">
            복잡한 절차가 어려우시다면?
          </h3>
          <p className="text-sm mb-4 text-blue-100">
            전문 법무사/변호사 상담 받아보세요
          </p>
          <Link href="/consultation">
            <button className="bg-white text-blue-600 font-semibold py-2 px-4 rounded hover:bg-gray-100 transition-colors">
              무료 상담 신청하기
            </button>
          </Link>
        </div>
        
        {/* 모바일 광고 */}
        <div className="block md:hidden mt-8">
          <AdSlot position="sidebar" />
        </div>
      </div>
    </div>
  );
} 