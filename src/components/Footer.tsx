'use client';

import { useAuth } from './AuthProvider';

export default function Footer() {
  const { user } = useAuth();

  function CopyrightYear() {
    return <>{new Date().getFullYear()}</>;
  }

  return (
    <footer className="w-full bg-white border-t mt-12 py-8">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <span className="font-bold tracking-wide">© 2025 개인회생파산 커뮤니티</span>
        </div>
        <div className="flex space-x-4">
          <a href="/advertising" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
            광고 문의
          </a>
          <a href="/advertiser/join" className="border border-blue-500 bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-blue-50">
            광고주 회원가입
          </a>
          
          {/* 광고주만 광고주 대시보드 링크 표시 */}
          {user?.role === 'advertiser' && (
            <a href="/advertiser/stats" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
              광고주 대시보드
            </a>
          )}
          
          {/* 관리자만 관리자 링크 표시 */}
          {user?.role === 'admin' && (
            <a href="/admin/dashboard" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
              관리자
            </a>
          )}
        </div>
      </div>
    </footer>
  );
} 