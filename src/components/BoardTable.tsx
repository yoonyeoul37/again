'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
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
  view_count?: number;
}

const PAGE_SIZE = 20;

export default function BoardTable() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      setPosts(data || []);
    }
    fetchPosts();
  }, []);

  // 페이지네이션 계산
  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const pagedPosts = posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-end mb-2">
        <Link
          href="/board/write"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm"
        >
          글쓰기
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-3 px-2 text-center">번호</th>
              <th className="py-3 px-2 text-center">말머리</th>
              <th className="py-3 px-2 text-left">제목</th>
              <th className="py-3 px-2 text-center">닉네임</th>
              <th className="py-3 px-2 text-center">날짜</th>
              <th className="py-3 px-2 text-center">조회수</th>
              <th className="py-3 px-2 text-center">힘내</th>
            </tr>
          </thead>
          <tbody>
            {pagedPosts.map((post, idx) => (
              <tr key={post.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2 text-center">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                <td className="py-2 px-2 text-center">{post.category}</td>
                <td className="py-2 px-2">
                  <Link href={`/post/${post.id}`} className="text-blue-700 hover:underline">
                    {post.title}
                  </Link>
                  {post.comment_count > 0 && (
                    <span className="ml-1 text-xs text-blue-500">💬 {post.comment_count}</span>
                  )}
                </td>
                <td className="py-2 px-2 text-center">{post.nickname}</td>
                <td className="py-2 px-2 text-center">{new Date(post.created_at).toLocaleDateString('ko-KR')}</td>
                <td className="py-2 px-2 text-center">{post.view_count ?? 0}</td>
                <td className="py-2 px-2 text-center text-orange-600 font-bold">{post.likes ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 페이지네이션 */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-9 h-9 rounded border text-sm font-semibold ${currentPage === page ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-blue-500 border-gray-300 hover:bg-blue-50'}`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
} 