import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "자유 커뮤니티",
  description: "자유롭게 소통하는 공간입니다"
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
      <body>
        <AuthProvider>
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
