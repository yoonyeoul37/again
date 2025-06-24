'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-[#333333] to-[#444444] shadow-md sticky top-0 z-50" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-blue-600 flex items-center justify-center shadow" style={{borderRadius: 0}}>
              <span className="text-white font-extrabold text-lg">회</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight drop-shadow">
              <span className="text-blue-200 font-extrabold">개인법인</span>회생파산워크아웃커뮤니티
            </span>
          </Link>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/news" 
              className="text-white font-semibold flex items-center gap-2 px-0 py-0"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
              관련뉴스
            </Link>
            <Link 
              href="/qa" 
              className="text-white font-semibold flex items-center gap-2 px-0 py-0"
            >
              <span className="w-4 h-4 mr-1">❓</span>
              Q/A
            </Link>
            <Link 
              href="/rules" 
              className="text-white font-semibold flex items-center gap-2 px-0 py-0 text-sm"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              커뮤니티이용수칙
            </Link>
          </nav>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-200 focus:outline-none focus:text-blue-200"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gradient-to-r from-[#333333] to-[#444444] border-t">
              <Link 
                href="/news" 
                className="text-white font-semibold flex items-center gap-2 px-0 py-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
                관련뉴스
              </Link>
              <Link 
                href="/qa" 
                className="text-white font-semibold flex items-center gap-2 px-0 py-0"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="w-4 h-4 mr-1">❓</span>
                Q/A
              </Link>
              <Link 
                href="/rules" 
                className="text-white font-semibold flex items-center gap-2 px-0 py-0 text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                커뮤니티이용수칙
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 