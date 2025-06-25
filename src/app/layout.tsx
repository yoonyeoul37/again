import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "힘내톡톡",
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
        <AuthProvider>
          <Header />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
