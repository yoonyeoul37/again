'use client';

import { useState } from 'react';
import Link from 'next/link';
import { samplePosts } from '@/data/sampleData';

export default function BoardPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPosts = selectedCategory === 'all' 
    ? samplePosts 
    : samplePosts.filter(post => post.category === selectedCategory);

  const categories = [
    '개인회생', '개인파산', '법인회생', '법인파산', '워크아웃', 
    '신용회복위원회', '대출', '신용카드', '신용점수', '회생절차', 
    '상환계획', '법무사상담', '회생비용', '파산비용', '재산관리', 
    '면책결정', '신용회복', '인가결정', '셀프신청', '개인신청', '취업관련'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">커뮤니티</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">총 {filteredPosts.length}개의 게시글</p>
            <Link 
              href="/board/write"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              글쓰기
            </Link>
          </div>
        </div>

        {/* 환영 메시지 */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">환영합니다! 👋</h2>
          <p className="text-gray-600">
            안전하고 따뜻한 공간에서 서로의 이야기를 나누어보세요. 
            익명으로 자유롭게 글을 작성할 수 있습니다.
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-2 min-w-0 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                selectedCategory === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category 
                    ? 'bg-blue-100 text-blue-700' 
                    : category === '취업' 
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {/* 디버깅용 - 취업 버튼이 있는지 확인 */}
          <div className="mt-2 text-xs text-gray-500">
            총 {categories.length}개 카테고리 (마지막: {categories[categories.length - 1]})
            <br />
            취업 카테고리 인덱스: {categories.indexOf('취업')} (찾지 못하면 -1)
          </div>
        </div>

        {/* 메뉴 */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="flex space-x-6">
            <Link 
              href="/rules"
              className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              커뮤니티이용수칙
            </Link>
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* 헤더 행 */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-1">번호</div>
              <div className="col-span-7">제목</div>
              <div className="col-span-2">날짜</div>
              <div className="col-span-2">조회수</div>
            </div>
          </div>

          {/* 게시글 행들 */}
          {filteredPosts.map((post, index) => (
            <div key={post.id} className="border-b border-gray-100 last:border-b-0">
              <Link href={`/post/${post.id}`} className="block hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 items-center">
                  <div className="col-span-1 text-sm text-gray-500">
                    {filteredPosts.length - index}
                  </div>
                  <div className="col-span-7">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">[{post.category}]</span>
                      <span className="text-[#333333] font-medium">{post.title}</span>
                      {post.commentCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                          {post.commentCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="col-span-2 text-sm text-gray-500">
                    {post.viewCount}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* 광고 슬롯 */}
        <div className="mt-8">
          <AdSlot />
        </div>
      </div>
    </div>
  );
}

// 광고 컴포넌트
function AdSlot() {
  return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="text-gray-500 text-sm">
        광고 영역
      </div>
    </div>
  );
} 