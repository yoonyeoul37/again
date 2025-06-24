import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "희망톡톡",
  description: "신용회복, 개인회생, 재도전 정보를 나누는 커뮤니티"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  function CopyrightYear() {
    return <>{new Date().getFullYear()}</>;
  }

  return (
    <html lang="ko">
      <head>
        {/* 구글 애드센스 스크립트 (실제 광고 ID로 교체 필요) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="w-full bg-white border-t mt-12 py-8">
          <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="font-bold tracking-wide">© 2025 개인회생파산 커뮤니티</span>
            </div>
            <div className="flex space-x-4">
              <a href="/advertising" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
                광고 문의
              </a>
              {/* 개발 환경에서만 관리자 링크 표시 */}
              {process.env.NODE_ENV === 'development' && (
                <>
              <a href="/advertiser/stats" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
                광고주 대시보드
              </a>
              <a href="/admin/dashboard" className="border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 hover:bg-gray-100">
                관리자
              </a>
                </>
              )}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
