'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

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

export default function MainBoardList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (error) {
        alert('글 목록 불러오기 실패: ' + error.message);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    }
    fetchPosts();
  }, []);

  // 관리자용 게시글 삭제 함수
  const handleAdminDeletePost = async (postId: string, postTitle: string) => {
    if (!user || user.role !== 'admin') return;
    if (confirm(`관리자 권한으로 게시글 "${postTitle}"을 삭제하시겠습니까?`)) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);
        if (error) {
          alert('게시글 삭제 중 오류가 발생했습니다.');
        } else {
          setPosts(prev => prev.filter(post => post.id !== postId));
          alert('게시글이 삭제되었습니다.');
          router.push('/');
        }
      } catch (error) {
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // NEW 표시 함수 (24시간 이내)
  function isNew(created_at: string | Date | undefined) {
    if (!created_at) return false;
    const created = typeof created_at === 'string' ? new Date(created_at) : created_at;
    if (isNaN(created.getTime())) return false;
    const now = new Date();
    return now.getTime() - created.getTime() < 24 * 60 * 60 * 1000;
  }

  return (
    <div className="bg-white p-4 rounded border">
      {posts.map((post, index) => (
        <div key={post.id} className="border-b border-gray-200 py-2 last:border-b-0 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-green-700 flex items-center gap-1">
              {index + 1}. {post.title}
              {isNew(post.created_at) && (
                <span className="ml-1 text-[10px] text-red-500 font-normal align-middle">NEW</span>
              )}
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
          {user?.role === 'admin' && (
            <button
              onClick={() => handleAdminDeletePost(post.id, post.title)}
              className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
              title="관리자 삭제"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              삭제
              🗑️
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 