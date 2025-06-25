"use client";
import Link from 'next/link';

export default function AdvertiserDashboard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-2xl font-bold mb-6">광고주 대시보드</h1>
      <div className="space-y-4 w-full max-w-md">
        <Link
          href="/advertiser/ads"
          className="block w-full py-3 px-4 bg-blue-600 text-white rounded text-center hover:bg-blue-700"
        >
          내 광고 목록 보기
        </Link>
        <Link
          href="/advertiser/ads/new"
          className="block w-full py-3 px-4 bg-green-600 text-white rounded text-center hover:bg-green-700"
        >
          새 광고 등록하기
        </Link>
        <Link
          href="/advertiser/stats"
          className="block w-full py-3 px-4 bg-indigo-600 text-white rounded text-center hover:bg-indigo-700"
        >
          광고 통계 보기
        </Link>
      </div>
    </div>
  );
} 