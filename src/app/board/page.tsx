'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

// Post 타입 정의
interface Post {
  id: string;
  title: string;
  content: string;
  nickname: string;
  category: string;
  created_at: string;
  images?: string | null;
  comment_count: number;
  likes?: number;
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      console.log('select error:', error);
      console.log('select data:', data);
      if (error) {
        alert('글 목록 불러오기 실패: ' + error.message);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  // 베스트글/일반글 분류 (likes 컬럼이 없으므로 모두 일반글로)
  const bestPosts: Post[] = [];
  const normalPosts = posts;

  // 디버깅용: posts 배열 콘솔 출력
  console.log('posts:', posts);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">커뮤니티 테스트</h1>
      
      {/* 테스트 정보 */}
      <div className="bg-blue-100 border-4 border-blue-500 p-6 mb-6 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">📊 테스트 정보</h2>
        <div className="bg-white p-4 rounded border">
          <p className="text-blue-600 font-bold">전체 게시글: {posts.length}개</p>
          <p className="text-blue-600 font-bold">베스트글: {bestPosts.length}개</p>
          <p className="text-blue-600 font-bold">일반글: {normalPosts.length}개</p>
        </div>
      </div>

      {/* 베스트글 영역 */}
      <div className="bg-yellow-100 border-4 border-yellow-500 p-6 mb-6 rounded-lg">
        <h2 className="text-2xl font-bold text-yellow-700 mb-4">🏆 베스트글 ({bestPosts.length}개)</h2>
        {bestPosts.length > 0 ? (
          <div className="bg-white p-4 rounded border">
            {bestPosts.map((post, index) => (
              <div key={post.id} className="border-b border-gray-200 py-2 last:border-b-0">
                <p className="text-yellow-700 font-bold flex items-center gap-1">
                  {index + 1}. {post.title}
                  {post.images && post.images.length > 0 && (
                    <img
                      src={Array.isArray(post.images) ? post.images[0] : post.images.split(',')[0]}
                      alt="썸네일"
                      className="w-4 h-4 object-cover rounded ml-1"
                      style={{ minWidth: 16, minHeight: 16 }}
                    />
                  )}
                </p>
                <p className="text-yellow-600 text-sm">👍 {post.likes || 0}개 추천</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded border">
            <p className="text-yellow-700 font-bold">베스트글이 없습니다!</p>
          </div>
        )}
      </div>

      {/* 일반글 영역 */}
      <div className="bg-green-100 border-4 border-green-500 p-6 mb-6 rounded-lg">
        <h2 className="text-2xl font-bold text-green-700 mb-4">📝 일반글 ({normalPosts.length}개)</h2>
        <div className="bg-white p-4 rounded border">
          {normalPosts.map((post, index) => (
            <div key={post.id} className="border-b border-gray-200 py-2 last:border-b-0">
              <p className="text-green-700 flex items-center gap-1">
                {index + 1}. {post.title}
                {post.images && typeof post.images === 'string' && post.images.trim() !== '' && (
                  <img
                    src={post.images.split(',')[0]}
                    alt="썸네일"
                    className="w-4 h-4 object-cover rounded ml-1"
                    style={{ minWidth: 16, minHeight: 16 }}
                  />
                )}
              </p>
              <p className="text-green-600 text-sm">👍 {post.likes || 0}개 추천</p>
            </div>
          ))}
        </div>
      </div>

      {/* 원래 페이지로 돌아가기 */}
      <div className="text-center">
        <Link 
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
} 