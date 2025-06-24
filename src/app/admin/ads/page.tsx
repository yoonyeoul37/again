'use client';

import { useState } from 'react';
import Link from 'next/link';

// 광고 데이터 타입
interface AdData {
  id: string;
  advertiser: string;
  region: string;
  title: string;
  description: string;
  imageUrl: string;
  phone: string;
  email: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'pending';
  price: number;
  impressions: number;
  clicks: number;
}

// 샘플 광고 데이터
const sampleAds: AdData[] = [
  {
    id: '1',
    advertiser: '강남법무사',
    region: '서울 전체 (25개 구)',
    title: '강남법무사 무료상담',
    description: '개인회생, 개인파산 전문 상담',
    imageUrl: '/ad-gangnam.jpg',
    phone: '02-1234-5678',
    email: 'gangnam@law.com',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    price: 110000,
    impressions: 1250,
    clicks: 45
  },
  {
    id: '2',
    advertiser: '송파변호사',
    region: '서울 전체 (25개 구)',
    title: '송파변호사 무료상담',
    description: '부채문제 해결 전문',
    imageUrl: '/ad-songpa.jpg',
    phone: '02-2345-6789',
    email: 'songpa@law.com',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'active',
    price: 110000,
    impressions: 980,
    clicks: 32
  },
  {
    id: '3',
    advertiser: '부산법무사',
    region: '부산 전체 (16개 구/군)',
    title: '부산법무사 무료상담',
    description: '부산지역 개인회생 전문',
    imageUrl: '/ad-busan.jpg',
    phone: '051-3456-7890',
    email: 'busan@law.com',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    status: 'pending',
    price: 88000,
    impressions: 0,
    clicks: 0
  },
  {
    id: '4',
    advertiser: '군지역법무사',
    region: '기타 군 지역',
    title: '군지역법무사 무료상담',
    description: '군지역 부채상담',
    imageUrl: '/ad-gun.jpg',
    phone: '031-0000-0000',
    email: 'gun@law.com',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    status: 'pending',
    price: 55000,
    impressions: 0,
    clicks: 0
  }
];

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdData[]>(sampleAds);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 지역 카테고리 목록
  const regionCategories = [
    { value: 'all', label: '전체 지역' },
    { value: 'seoul', label: '서울' },
    { value: 'busan', label: '부산' },
    { value: 'daegu', label: '대구' },
    { value: 'gwangju', label: '광주' },
    { value: 'ulsan', label: '울산' },
    { value: 'gyeonggi', label: '경기도' },
    { value: 'gangwon', label: '강원도' },
    { value: 'chungbuk', label: '충청북도' },
    { value: 'chungnam', label: '충청남도' },
    { value: 'jeonbuk', label: '전라북도' },
    { value: 'jeonnam', label: '전라남도' },
    { value: 'gyeongbuk', label: '경상북도' },
    { value: 'gyeongnam', label: '경상남도' },
    { value: 'jeju', label: '제주도' }
  ];

  const filteredAds = ads.filter(ad => {
    const matchesStatus = selectedStatus === 'all' || ad.status === selectedStatus;
    const matchesRegion = selectedRegion === 'all' || ad.region.toLowerCase().includes(selectedRegion);
    const matchesSearch = ad.advertiser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.region.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesRegion && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'pending': return '대기중';
      default: return '알 수 없음';
    }
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
              <h1 className="text-2xl font-bold text-gray-900">광고 관리</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/ads/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                새 광고 등록
              </Link>
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                대시보드로
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 광고</p>
                <p className="text-3xl font-bold text-blue-600">{ads.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 광고</p>
                <p className="text-3xl font-bold text-green-600">{ads.filter(ad => ad.status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 노출</p>
                <p className="text-3xl font-bold text-purple-600">{ads.reduce((sum, ad) => sum + ad.impressions, 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-3xl font-bold text-orange-600">{ads.reduce((sum, ad) => sum + ad.clicks, 0).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          {/* 지역 필터 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">지역별 필터</label>
            <div className="flex flex-wrap gap-2">
              {regionCategories.map(category => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedRegion(category.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedRegion === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="광고주명 또는 지역으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="pending">대기중</option>
              </select>
            </div>
          </div>
        </div>

        {/* 광고 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">광고주</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">광고 제목</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">계약 기간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수익</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">성과</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ad.advertiser}</div>
                        <div className="text-sm text-gray-500">{ad.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{ad.region}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                        <div className="text-sm text-gray-500">{ad.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                        {getStatusText(ad.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{ad.startDate} ~ {ad.endDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(ad.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>노출: {ad.impressions.toLocaleString()}</div>
                        <div>클릭: {ad.clicks.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          CTR: {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0'}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">수정</button>
                        <button className="text-red-600 hover:text-red-900">삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAds.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">등록된 광고가 없습니다.</div>
            <Link href="/admin/ads/new" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              첫 번째 광고 등록하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 