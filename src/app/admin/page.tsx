"use client";
import { useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [toast, setToast] = useState("");

  function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    if (!message) return null;
    return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg">
        {message}
        <button onClick={onClose} className="ml-4 text-white/80 hover:text-white text-xs">닫기</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast message={toast} onClose={() => setToast("")} />
      
      {/* 메인 헤더 */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-700 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center shadow rounded-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.09-3.27C3.4 15.1 3 13.59 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight drop-shadow">
                신복이! <span className="text-green-200 font-extrabold text-sm">개인법인회생파산 정보공유</span>
              </span>
            </Link>

            {/* 관리자 메뉴 */}
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <span className="text-white bg-red-500 px-3 py-1 rounded-full font-bold">관리자</span>
              <Link href="/admin/dashboard" className="text-white/80 hover:text-white font-semibold transition-colors">
                대시보드
              </Link>
              <Link href="/admin/ads" className="text-white/80 hover:text-white font-semibold transition-colors">
                광고 관리
              </Link>
              <Link href="/admin/ads/banner" className="text-white/80 hover:text-white font-semibold transition-colors">
                개인광고
              </Link>
              <Link href="/admin/news" className="text-white/80 hover:text-white font-semibold transition-colors">
                뉴스 관리
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* 메인 컨텐츠 */}
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 사용자</p>
                  <p className="text-2xl font-semibold text-gray-900">1,234</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 게시글</p>
                  <p className="text-2xl font-semibold text-gray-900">567</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">총 댓글</p>
                  <p className="text-2xl font-semibold text-gray-900">2,345</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">활성 광고</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/admin/ads" 
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <h3 className="font-medium text-blue-900">광고 관리</h3>
                <p className="text-sm text-blue-700 mt-1">광고 생성, 수정, 삭제</p>
              </Link>
              
              <Link 
                href="/admin/news" 
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 className="font-medium text-green-900">뉴스 관리</h3>
                <p className="text-sm text-green-700 mt-1">뉴스 작성 및 편집</p>
              </Link>
              
              <Link 
                href="/admin/dashboard" 
                className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <h3 className="font-medium text-purple-900">상세 대시보드</h3>
                <p className="text-sm text-purple-700 mt-1">통계 및 분석</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 