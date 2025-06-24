'use client';

import { useState } from 'react';
import Link from 'next/link';

// 광고 통계 데이터 타입
interface AdStats {
  id: string;
  title: string;
  region: string;
  impressions: number;
  clicks: number;
  ctr: number;
  dailyStats: {
    date: string;
    impressions: number;
    clicks: number;
  }[];
}

// 샘플 데이터
const sampleStats: AdStats[] = [
  {
    id: '1',
    title: '강남법무사 무료상담',
    region: '서울 전체',
    impressions: 1250,
    clicks: 45,
    ctr: 3.6,
    dailyStats: [
      { date: '2024-01-01', impressions: 120, clicks: 4 },
      { date: '2024-01-02', impressions: 135, clicks: 5 },
      { date: '2024-01-03', impressions: 110, clicks: 3 },
      { date: '2024-01-04', impressions: 145, clicks: 6 },
      { date: '2024-01-05', impressions: 130, clicks: 4 },
      { date: '2024-01-06', impressions: 125, clicks: 5 },
      { date: '2024-01-07', impressions: 140, clicks: 4 },
      { date: '2024-01-08', impressions: 155, clicks: 7 },
      { date: '2024-01-09', impressions: 120, clicks: 3 },
      { date: '2024-01-10', impressions: 130, clicks: 4 }
    ]
  },
  {
    id: '2',
    title: '송파변호사 무료상담',
    region: '서울 전체',
    impressions: 980,
    clicks: 32,
    ctr: 3.3,
    dailyStats: [
      { date: '2024-01-01', impressions: 95, clicks: 3 },
      { date: '2024-01-02', impressions: 105, clicks: 4 },
      { date: '2024-01-03', impressions: 90, clicks: 2 },
      { date: '2024-01-04', impressions: 110, clicks: 4 },
      { date: '2024-01-05', impressions: 100, clicks: 3 },
      { date: '2024-01-06', impressions: 95, clicks: 3 },
      { date: '2024-01-07', impressions: 105, clicks: 4 },
      { date: '2024-01-08', impressions: 115, clicks: 5 },
      { date: '2024-01-09', impressions: 90, clicks: 2 },
      { date: '2024-01-10', impressions: 100, clicks: 4 }
    ]
  }
];

export default function AdvertiserStatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedAd, setSelectedAd] = useState<string>('all');

  const totalImpressions = sampleStats.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = sampleStats.reduce((sum, ad) => sum + ad.clicks, 0);
  const totalCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatPercentage = (num: number) => {
    return num.toFixed(2);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return '최근 7일';
      case '30d': return '최근 30일';
      case '90d': return '최근 90일';
      default: return '전체';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">광고 통계</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/advertising" className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                광고 등록
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 기간 선택 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">통계 기간</h2>
              <p className="text-sm text-gray-600">광고 성과를 확인할 기간을 선택하세요</p>
            </div>
            <div className="flex space-x-2">
              {['7d', '30d', '90d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getPeriodLabel(period)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 전체 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 노출</p>
                <p className="text-3xl font-bold text-blue-600">{formatNumber(totalImpressions)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 클릭</p>
                <p className="text-3xl font-bold text-green-600">{formatNumber(totalClicks)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 CTR</p>
                <p className="text-3xl font-bold text-purple-600">{formatPercentage(totalCTR)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 광고</p>
                <p className="text-3xl font-bold text-orange-600">{sampleStats.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 광고별 상세 통계 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">광고별 상세 통계</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">광고 제목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">노출</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">클릭</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세보기</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleStats.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{ad.region}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatNumber(ad.impressions)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatNumber(ad.clicks)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{formatPercentage(ad.ctr)}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => setSelectedAd(selectedAd === ad.id ? 'all' : ad.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {selectedAd === ad.id ? '접기' : '펼치기'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 일별 상세 통계 (선택된 광고) */}
        {selectedAd !== 'all' && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {sampleStats.find(ad => ad.id === selectedAd)?.title} - 일별 통계
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">노출</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">클릭</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleStats
                    .find(ad => ad.id === selectedAd)
                    ?.dailyStats.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(day.date).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(day.impressions)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(day.clicks)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {day.impressions > 0 ? formatPercentage((day.clicks / day.impressions) * 100) : '0'}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 성과 분석 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">성과 분석</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📈 긍정적 지표</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 평균 CTR이 3.5%로 업계 평균(2-3%) 대비 우수</li>
                <li>• 일일 노출이 안정적으로 유지되고 있음</li>
                <li>• 클릭 수가 꾸준히 증가하는 추세</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">💡 개선 제안</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 광고 이미지 최적화로 CTR 향상 가능</li>
                <li>• 지역별 타겟팅 세분화 고려</li>
                <li>• A/B 테스트를 통한 광고 문구 개선</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 