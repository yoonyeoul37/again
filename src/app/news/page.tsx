import Link from 'next/link';
import { sampleNews } from '@/data/sampleData';

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      {/* 메인 헤더 */}
      <header className="bg-gradient-to-r from-[#333333] to-[#444444] shadow-md sticky top-0 z-50" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center shadow rounded-full">
                {/* 말풍선(채팅) SVG 아이콘 */}
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.09-3.27C3.4 15.1 3 13.59 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight drop-shadow">
                개인회생119 <span className="text-green-200 font-extrabold text-sm ml-2">개인법인회생파산 정보공유</span>
              </span>
            </Link>

            {/* 페이지 메뉴 */}
            <nav className="hidden md:flex items-center space-x-6 text-sm">
              <span className="text-white bg-green-500 px-3 py-1 rounded-full font-bold">뉴스</span>
              <Link href="/" className="text-white/80 hover:text-white font-semibold transition-colors">
                홈으로
              </Link>
              <Link href="/rules" className="text-white/80 hover:text-white font-semibold transition-colors">
                이용수칙
              </Link>
              <Link href="/qa" className="text-white/80 hover:text-white font-semibold transition-colors">
                Q&A
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            회생·파산 관련 뉴스
          </h1>
          
          <div className="space-y-4">
            {sampleNews.map((news) => (
              <div key={news.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      <a 
                        href={news.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-blue-600 transition-colors"
                      >
                        {news.title}
                      </a>
                    </h2>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {news.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">{news.source}</span>
                      <span>{news.date}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      news.category === '개인회생' ? 'bg-blue-100 text-blue-700' :
                      news.category === '개인파산' ? 'bg-red-100 text-red-700' :
                      news.category === '법인회생' ? 'bg-green-100 text-green-700' :
                      news.category === '법인파산' ? 'bg-orange-100 text-orange-700' :
                      news.category === '워크아웃' ? 'bg-purple-100 text-purple-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {news.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 하단 안내 */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              위 뉴스는 외부 링크로 연결됩니다. 더 많은 정보는 각 언론사 홈페이지를 참고하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 