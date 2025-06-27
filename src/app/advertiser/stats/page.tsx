'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { getAdStats } from '@/lib/adStats';

// 광고 통계 데이터 타입
interface AdStats {
  id: number;
  ad_id: number;
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface Ad {
  id: number;
  title: string;
  region: string;
  status: string;
}

export default function AdvertiserStatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedAd, setSelectedAd] = useState<string>('all');
  const [stats, setStats] = useState<AdStats[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  // 광고 목록 가져오기
  useEffect(() => {
    async function fetchAds() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('ads')
          .select('id, title, status')
          .eq('advertiser_id', user.id)
          .eq('status', 'active');

        if (error) {
          console.error('광고 목록 조회 실패:', error);
          return;
        }

        setAds(data || []);
      } catch (error) {
        console.error('광고 목록 조회 중 오류:', error);
      }
    }

    fetchAds();
  }, []);

  // 통계 데이터 가져오기
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 기간 계산
        const endDate = new Date().toISOString().split('T')[0];
        let startDate = new Date();
        
        switch (selectedPeriod) {
          case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
          default:
            startDate = new Date('2020-01-01'); // 전체 기간
        }

        const startDateStr = startDate.toISOString().split('T')[0];

        // 선택된 광고의 통계 가져오기
        if (selectedAd === 'all') {
          // 모든 광고의 통계
          const allStats: AdStats[] = [];
          for (const ad of ads) {
            const adStats = await getAdStats(ad.id, startDateStr, endDate);
            allStats.push(...adStats);
          }
          setStats(allStats);
        } else {
          // 특정 광고의 통계
          const adStats = await getAdStats(parseInt(selectedAd), startDateStr, endDate);
          setStats(adStats);
        }
      } catch (error) {
        console.error('통계 조회 중 오류:', error);
      } finally {
        setLoading(false);
      }
    }

    if (ads.length > 0) {
      fetchStats();
    }
  }, [selectedPeriod, selectedAd, ads]);

  // 통계 계산
  const totalImpressions = stats.reduce((sum, stat) => sum + stat.impressions, 0);
  const totalClicks = stats.reduce((sum, stat) => sum + stat.clicks, 0);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
        {/* 기간 및 광고 선택 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">통계 설정</h2>
              <p className="text-sm text-gray-600">광고 성과를 확인할 기간과 광고를 선택하세요</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 기간 선택 */}
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
              
              {/* 광고 선택 */}
              <select
                value={selectedAd}
                onChange={(e) => setSelectedAd(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">모든 광고</option>
                {ads.map((ad) => (
                  <option key={ad.id} value={ad.id.toString()}>
                    {ad.title}
                  </option>
                ))}
              </select>
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
                <p className="text-3xl font-bold text-orange-600">{ads.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 통계 테이블 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">일별 상세 통계</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    노출
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    클릭
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.length > 0 ? (
                  stats.map((stat) => (
                    <tr key={stat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(stat.date).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(stat.impressions)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(stat.clicks)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPercentage(stat.ctr)}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      선택한 기간에 통계 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 