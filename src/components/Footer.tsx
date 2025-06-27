'use client';

import { useAuth } from '@/components/AuthProvider';

export default function Footer() {
  const { user, isLoading, logout } = useAuth();

  function CopyrightYear() {
    return <>{new Date().getFullYear()}</>;
  }

  // 역할 한글 변환
  const getRoleLabel = (role: string) => {
    if (role === 'admin') return '관리자';
    if (role === 'advertiser') return '광고주';
    return '일반회원';
  };

  // 디버깅용: 현재 상태 출력
  console.log('Footer - user:', user);
  console.log('Footer - role:', user?.role);
  console.log('Footer - isLoading:', isLoading);
  console.log('Footer - !user:', !user);

  return (
    <footer className="w-full bg-white border-t mt-12 py-8">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <span className="font-bold tracking-wide">© 2025 개인법인회생파산 커뮤니티</span>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* 로딩 중일 때 */}
          {isLoading && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              로딩 중...
            </span>
          )}

          {/* 로그인하지 않은 경우 */}
          {!isLoading && !user && (
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <a href="/advertising" className="hover:text-blue-500 transition">광고 문의</a>
              <span>|</span>
              <a href="/advertiser/join" className="hover:text-blue-500 transition">광고주 회원가입</a>
              <span>|</span>
              <a href="/login?role=advertiser" className="hover:text-blue-500 transition">광고주 로그인</a>
              <span>|</span>
              <a href="/login?role=admin" className="hover:text-blue-500 transition">관리자 로그인</a>
            </div>
          )}

          {/* 로그인한 경우 */}
          {!isLoading && user && (
            <>
              <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                로그인됨: <b>{user.email}</b> ({getRoleLabel(user.role)})
              </span>
              
              {/* 관리자인 경우 */}
              {user.role === 'admin' && (
                <a href="/admin/dashboard" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
                  관리자 대시보드
                </a>
              )}
              
              {/* 광고주인 경우 */}
              {user.role === 'advertiser' && (
                <a href="/advertiser/dashboard" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
                  광고주 대시보드
                </a>
              )}
              
              <button
                onClick={logout}
                className="border border-gray-400 bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-200"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
} 