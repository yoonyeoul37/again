'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id;

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    nickname: '',
    password: ''
  });
  const [originalPost, setOriginalPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['전체', '개인회생', '개인파산', '워크아웃', '신용점수', '대출관련', '법무사상담', '변호사상담', '기타'];

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // 게시글 데이터 가져오기
  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) {
        console.error('게시글 가져오기 실패:', error);
        alert('게시글을 찾을 수 없습니다.');
        router.push('/');
        return;
      }

      setOriginalPost(data);
      setFormData({
        category: data.category,
        title: data.title,
        content: data.content,
        nickname: data.nickname,
        password: '' // 비밀번호는 비워둠
      });
    } catch (error) {
      console.error('게시글 가져오기 오류:', error);
      alert('오류가 발생했습니다.');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password.trim()) {
      alert('수정하려면 원래 비밀번호를 입력해주세요.');
      return;
    }

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 비밀번호 확인을 위해 원본 게시글과 비교
      // 실제로는 서버에서 비밀번호를 검증해야 함
      const { data, error } = await supabase
        .from('posts')
        .update({
          category: formData.category,
          title: formData.title,
          content: formData.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('password', formData.password) // 비밀번호 확인
        .select();

      if (error || !data || data.length === 0) {
        alert('비밀번호가 일치하지 않거나 수정에 실패했습니다.');
        return;
      }

      alert('게시글이 수정되었습니다.');
      router.push(`/post/${postId}`);

    } catch (error) {
      console.error('게시글 수정 실패:', error);
      alert('게시글 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    if (confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
      router.push(`/post/${postId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="bg-gray-800 shadow-lg h-20">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <a href="/" className="text-white flex items-center gap-3">
            <div className="text-2xl">🌟</div>
            <div>
              <div className="text-lg font-bold">힘내톡톡</div>
              <div className="text-xs text-gray-300">💡 신용회복, 개인회생, 재도전 정보 공유</div>
            </div>
          </a>
          
          <nav className="flex items-center space-x-6">
            <a href="/qa" className="text-white/80 hover:text-white text-sm transition-colors">
              Q&A
            </a>
            <a href="/news" className="text-white/80 hover:text-white text-sm transition-colors">
              뉴스
            </a>
            <a href="/rules" className="text-white/80 hover:text-white text-sm transition-colors">
              이용수칙
            </a>
          </nav>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">게시글 수정</h1>
            <p className="text-gray-600">게시글 내용을 수정할 수 있습니다.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 카테고리 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {categories.filter(cat => cat !== '전체').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* 제목 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="제목을 입력해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                maxLength={100}
              />
            </div>

            {/* 닉네임 (수정 불가) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={formData.nickname}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">닉네임은 수정할 수 없습니다.</p>
            </div>

            {/* 비밀번호 확인 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="게시글 작성 시 입력한 비밀번호"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">수정하려면 원래 비밀번호를 입력해주세요.</p>
            </div>

            {/* 내용 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="내용을 입력해주세요"
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 