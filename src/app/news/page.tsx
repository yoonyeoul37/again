import Link from 'next/link';
import { sampleNews } from '@/data/sampleData';

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
  );
} 