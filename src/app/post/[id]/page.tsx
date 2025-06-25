'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { samplePosts, sampleComments } from '@/data/sampleData';
import { Post, Comment, CommentFormData } from '@/types';
import AdSlot from '@/components/AdSlot';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';

// 지역별 광고 데이터 (메인 페이지와 동일)
const regionAds = {
  '송파구': { image: '/ad-songpa.jpg', text: '송파구 법무사 무료상담 ☎ 02-1234-5678' },
  '강남구': { image: '/ad-gangnam.jpg', text: '강남구 법무사 무료상담 ☎ 02-2345-6789' },
  default: { image: '/001.jpg', text: '전국 법무사 무료상담 ☎ 1588-0000' }
};

// function useRegionAd() {
//   const [ad, setAd] = useState(regionAds.default);
//   useEffect(() => {
//     if (!navigator.geolocation) return;
//     navigator.geolocation.getCurrentPosition(async (pos) => {
//       const { latitude, longitude } = pos.coords;
//       // 카카오 REST API Key 필요! 아래 YOUR_REST_API_KEY를 발급받은 키로 교체하세요.
//       const res = await fetch(
//         `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${longitude}&y=${latitude}`,
//         { headers: { Authorization: 'KakaoAK YOUR_REST_API_KEY' } }
//       );
//       const data = await res.json();
//       const regionName = data.documents?.[0]?.region_2depth_name || '';
//       setAd(regionAds[regionName] || regionAds.default);
//     }, () => {
//       setAd(regionAds.default);
//     });
//   }, []);
//   return ad;
// }

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  // const ad = useRegionAd(); // 위치 광고 훅 사용 제거

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState({ content: '', nickname: '', password: '' });
  const [replyForm, setReplyForm] = useState<{ [key: string]: { content: string; nickname: string } }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [cheered, setCheered] = useState(false);
  const [showCommentToast, setShowCommentToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 글 순번 계산용
  const [postNumber, setPostNumber] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    nickname: '',
    category: '',
    images: '',
  });
  const [pwModal, setPwModal] = useState<{mode: 'edit' | 'delete' | null, open: boolean}>({mode: null, open: false});
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      const { data, error } = await supabase.from('posts').select('*').eq('id', postId).single();
      if (error || !data) {
        setError('게시글을 찾을 수 없습니다.');
        setPost(null);
      } else {
        setPost(data);
        setError(null);
        // 조회수 증가 - 더 안전한 처리
        try {
          const currentViewCount = data.view_count || 0;
          const { error: updateError } = await supabase
            .from('posts')
            .update({ view_count: currentViewCount + 1 })
            .eq('id', postId);
          if (updateError) {
            console.error('조회수 증가 실패:', updateError);
            console.error('에러 상세:', JSON.stringify(updateError, null, 2));
          } else {
            console.log('조회수 증가 성공:', currentViewCount + 1);
          }
        } catch (err) {
          console.error('조회수 증가 중 오류:', err);
        }
        // 글 순번 계산
        try {
          const { data: allPosts, error: allPostsError } = await supabase
            .from('posts')
            .select('id')
            .order('created_at', { ascending: false });
          if (!allPostsError && allPosts) {
            const idx = allPosts.findIndex((p: any) => p.id === postId);
            setPostNumber(idx !== -1 ? idx + 1 : null);
          }
        } catch (err) {
          setPostNumber(null);
        }
      }
      setLoading(false);
    }
    fetchPost();
  }, [postId]);

  // 댓글 목록 불러오기 (DB 연동)
  useEffect(() => {
    async function fetchComments() {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setComments(data);
      }
    }
    fetchComments();
  }, [postId]);

  // 게시글별 힘내 중복 방지 (로컬스토리지)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = `cheered_${postId}`;
      if (localStorage.getItem(key)) {
        setCheered(true);
      }
    }
  }, [postId]);

  // 댓글 작성 (DB 연동)
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.content.trim() || !commentForm.nickname.trim() || !commentForm.password.trim()) {
      setShowCommentToast(true);
      setTimeout(() => setShowCommentToast(false), 2000);
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. 댓글 DB에 저장
      const { data, error } = await supabase.from('comments').insert([
        {
          post_id: postId,
          content: commentForm.content,
          nickname: commentForm.nickname,
          password: commentForm.password,
        }
      ]);
      if (!error) {
        // 2. posts 테이블의 comment_count 1 증가
        await supabase
          .from('posts')
          .update({ comment_count: (post?.comment_count ?? 0) + 1 })
          .eq('id', postId);
        // 3. 댓글 목록 다시 불러오기
        const { data: newComments } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: false });
        setComments(newComments || []);
        setCommentForm({ content: '', nickname: '', password: '' });
        setReplyTo(null);
        setShowCommentToast(true);
        setTimeout(() => setShowCommentToast(false), 2000);
      }
    } catch (error) {
      console.error('댓글 작성 중 오류 발생:', error);
      setShowCommentToast(true);
      setTimeout(() => setShowCommentToast(false), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '개인회생':
        return 'bg-blue-100 text-blue-800';
      case '이혼상담':
        return 'bg-pink-100 text-pink-800';
      case '법인파산':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 댓글 삭제
  const handleDeleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
    setPost(prev => prev ? { ...prev, commentCount: prev.commentCount - 1 } : null);
  };

  // 댓글 수정 시작
  const handleEditComment = (id: string, content: string) => {
    setEditingCommentId(id);
    setEditingContent(content);
  };

  // 댓글 수정 저장
  const handleSaveEdit = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, content: editingContent } : c));
    setEditingCommentId(null);
    setEditingContent('');
  };

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  // 대댓글 작성 시작
  const handleReplyClick = (id: string) => {
    setReplyTo(id);
  };

  // 대댓글 작성 취소
  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleReplyInputChange = (commentId: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReplyForm(prev => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        [name]: value
      }
    }));
  };

  const handleReplySubmit = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const form = replyForm[commentId] || { content: '', nickname: '' };
    if (!form.content.trim() || !form.nickname.trim()) {
      setShowCommentToast(true);
      setTimeout(() => setShowCommentToast(false), 2000);
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. 대댓글 DB에 저장
      await supabase.from('comments').insert([
        {
          post_id: postId,
          content: form.content,
          nickname: form.nickname,
          parent_id: commentId
        }
      ]);
      // 2. posts 테이블의 comment_count 1 증가
      await supabase
        .from('posts')
        .update({ comment_count: (post?.comment_count ?? 0) + 1 })
        .eq('id', postId);
      // 3. 최신 posts 데이터 다시 불러오기
      const { data: updatedPost, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
      if (!postError && updatedPost) {
        setPost(updatedPost);
      }
      // 4. 댓글 목록 다시 불러오기
      const { data: newComments } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      setComments(newComments || []);
      setReplyForm(prev => ({ ...prev, [commentId]: { content: '', nickname: '' } }));
      setReplyTo(null);
      setShowCommentToast(true);
      setTimeout(() => setShowCommentToast(false), 2000);
    } catch (error) {
      setShowCommentToast(true);
      setTimeout(() => setShowCommentToast(false), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheer = async () => {
    if (cheered) return;
    setCheered(true);
    // 1. DB에 추천수 1 증가
    await supabase
      .from('posts')
      .update({ likes: (post?.likes ?? 0) + 1 })
      .eq('id', postId);
    // 2. 최신 posts 데이터 다시 불러오기
    const { data: updatedPost, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();
    if (!error && updatedPost) {
      setPost(updatedPost);
    }
    // 3. (선택) 로컬스토리지 등 중복 방지
    if (typeof window !== 'undefined') {
      const key = `cheered_${postId}`;
      localStorage.setItem(key, '1');
    }
  };

  // 트리 구조로 댓글 렌더링 (들여쓰기 없이)
  function renderComments(parentId: string | null = null) {
    return comments
      .filter(c => c.parent_id === parentId)
      .map(comment => {
        const parentComment = comment.parent_id
          ? comments.find(c => c.id === comment.parent_id)
          : null;
        return (
          <div key={comment.id} className="w-full">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  💬 댓글
                </span>
                {parentComment && (
                  <span className="text-sm text-blue-600 font-medium">
                    ↳ @{parentComment.nickname}
                  </span>
                )}
                <span className="font-semibold text-gray-900 text-base">
                  {comment.nickname || '익명'}
                </span>
                <span className="text-sm text-gray-400">{new Date(comment.created_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}</span>
              </div>
              <div className="flex flex-col gap-3">
                {editingCommentId === comment.id ? (
                  <>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => handleSaveEdit(comment.id)} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
                      >
                        저장
                      </button>
                      <button 
                        type="button" 
                        onClick={handleCancelEdit} 
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    <div className="flex gap-3 justify-end mt-2">
                      <button 
                        type="button" 
                        onClick={() => handleEditComment(comment.id, comment.content)} 
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        수정
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteComment(comment.id)} 
                        className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                      >
                        삭제
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleReplyClick(comment.id)} 
                        className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
                      >
                        ↳ 답글
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* 대댓글 작성 폼 */}
            {replyTo === comment.id && (
              <form onSubmit={e => handleReplySubmit(comment.id, e)} className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    name="nickname"
                    value={replyForm[comment.id]?.nickname || ''}
                    onChange={e => handleReplyInputChange(comment.id, e)}
                    placeholder="닉네임"
                    className="w-28 h-8 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-transparent"
                    required
                    maxLength={20}
                  />
                  <textarea
                    name="content"
                    value={replyForm[comment.id]?.content || ''}
                    onChange={e => handleReplyInputChange(comment.id, e)}
                    placeholder="답글을 입력하세요..."
                    rows={1}
                    className="flex-1 h-8 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-transparent resize-none placeholder-gray-400 leading-relaxed"
                    required
                    maxLength={500}
                    style={{ minHeight: '2rem', maxHeight: '3.5rem' }}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-8 px-3 text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? '작성 중...' : '등록'}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    {(replyForm[comment.id]?.content || '').length}/500
                  </p>
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
                  >
                    취소
                  </button>
                </div>
              </form>
            )}
            {/* 답글(대댓글) 트리 구조로 렌더링, 들여쓰기 없이 */}
            {renderComments(comment.id)}
          </div>
        );
      });
  }

  if (loading) return <div className="py-20 text-center text-gray-400 text-lg">로딩 중...</div>;
  if (error) return <div className="py-20 text-center text-gray-400 text-lg">{error}</div>;
  if (!post) return <div className="py-20 text-center text-gray-400 text-lg">게시글이 없습니다.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 2단 레이아웃: 게시글 + 사이드바 */}
        <div className="flex gap-8">
          {/* 왼쪽: 게시글 카드 */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-6 relative">
              {/* 카테고리, 글번호, 날짜, 조회수, 댓글수 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{post?.category}</span>
                  {postNumber !== null && (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 ml-1">No.{postNumber}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{post?.created_at ? `${new Date(post.created_at).getFullYear()}.${(new Date(post.created_at).getMonth() + 1).toString().padStart(2, '0')}.${new Date(post.created_at).getDate().toString().padStart(2, '0')}` : ''}</span>
                  <span className="flex items-center gap-1"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> {post?.view_count ?? 0}</span>
                  <span className="flex items-center gap-1"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2m4-4v4m0 0l-2-2m2 2l2-2" /></svg> {post?.comment_count ?? 0}</span>
                </div>
              </div>
              {/* 제목 + 수정/삭제 아이콘 */}
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex-1">{post?.title}</h1>
                <div className="flex gap-2 items-center ml-2">
                  <button
                    type="button"
                    title="수정"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-blue-600"
                    onClick={() => { setPwModal({mode: 'edit', open: true}); setPwInput(''); setPwError(''); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3zm0 0v3h3" /></svg>
                  </button>
                  <button
                    type="button"
                    title="삭제"
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-500"
                    onClick={() => { setPwModal({mode: 'delete', open: true}); setPwInput(''); setPwError(''); }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </button>
                </div>
              </div>
              {/* 닉네임 */}
              <div className="text-gray-500 text-sm mb-6">{post?.nickname}</div>
              {/* 본문 */}
              <div className="text-gray-800 text-base whitespace-pre-line mb-8">
                {isEditing ? (
                  <form onSubmit={async e => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    const { error } = await supabase.from('posts').update({
                      title: editForm.title,
                      content: editForm.content,
                      nickname: editForm.nickname,
                      category: editForm.category,
                      images: editForm.images,
                    }).eq('id', postId);
                    setIsSubmitting(false);
                    if (!error) {
                      alert('수정이 완료되었습니다.');
                      setPost(post => post ? { ...post, ...editForm } : post);
                      setIsEditing(false);
                    } else {
                      alert('수정 중 오류 발생: ' + error.message);
                    }
                  }} className="space-y-4">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-lg font-bold"
                      maxLength={100}
                      required
                    />
                    <input
                      type="text"
                      value={editForm.nickname}
                      onChange={e => setEditForm(f => ({ ...f, nickname: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      maxLength={8}
                      required
                    />
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    >
                      <option value="개인회생">개인회생</option>
                      <option value="개인파산">개인파산</option>
                      <option value="법인회생">법인회생</option>
                      <option value="법인파산">법인파산</option>
                      <option value="워크아웃">워크아웃</option>
                      <option value="신용회복위원회">신용회복위원회</option>
                      <option value="대출">대출관련</option>
                      <option value="신용카드">신용카드</option>
                      <option value="신용점수">신용점수</option>
                      <option value="회생절차">회생절차</option>
                      <option value="상환계획">상환계획</option>
                      <option value="법무사상담">법무사상담</option>
                      <option value="변호사상담">변호사상담</option>
                      <option value="회생비용">회생비용</option>
                      <option value="파산비용">파산비용</option>
                      <option value="인가결정">인가결정</option>
                      <option value="셀프신청">셀프신청</option>
                      <option value="개인신청">개인신청</option>
                      <option value="취업">취업관련</option>
                    </select>
                    <textarea
                      value={editForm.content}
                      onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-base"
                      rows={8}
                      maxLength={2000}
                      required
                    />
                    {/* 이미지 수정은 추후 지원 */}
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold transition-colors"
                        onClick={() => setIsEditing(false)}
                        disabled={isSubmitting}
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold transition-colors"
                        disabled={isSubmitting}
                      >
                        저장
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {post?.content}
                    {/* 이미지 표시 */}
                    {post?.images && post.images.length > 0 && (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {post.images.split(',').map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`게시글 이미지 ${index + 1}`}
                              className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* 힘내 버튼 등 기존 내용은 그대로 */}
              <div className="flex flex-col items-center justify-center mt-8">
                <button
                  type="button"
                  onClick={handleCheer}
                  disabled={cheered}
                  className={`flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 text-base font-semibold ${cheered ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl'}`}
                >
                  <span className="text-xl">👍</span>
                  <span>힘내</span>
                  <span className="ml-1 text-sm font-bold">{post?.likes ?? 0}</span>
                </button>
                {cheered && (
                  <span className="mt-3 text-sm text-gray-500">이미 힘내를 눌렀어요!</span>
                )}
              </div>
            </div>

            {/* 게시글 아래 광고 */}
            <div className="mb-6">
              <AdSlot position="content" />
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-8">
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-6">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2m4-4v4m0 0l-2-2m2 2l2-2" /></svg>
                  <span className="text-sm font-normal text-gray-500">💬 댓글 {comments.length}</span>
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-10 p-4 bg-gray-50 rounded-xl">
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        name="nickname"
                        value={commentForm.nickname}
                        onChange={handleInputChange}
                        placeholder="닉네임"
                        className="w-28 h-10 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        maxLength={20}
                      />
                      <input
                        type="password"
                        name="password"
                        value={commentForm.password}
                        onChange={handleInputChange}
                        placeholder="비밀번호(수정/삭제용)"
                        className="w-32 h-10 px-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        minLength={4}
                        maxLength={20}
                      />
                      <textarea
                        name="content"
                        value={commentForm.content}
                        onChange={handleInputChange}
                        placeholder="댓글을 입력하세요..."
                        rows={2}
                        className="flex-1 h-10 px-2 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400 leading-relaxed"
                        required
                        maxLength={500}
                        style={{ minHeight: '2.5rem', maxHeight: '4.5rem' }}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-10 px-4 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                      >
                        {isSubmitting ? '작성 중...' : '등록'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {commentForm.content.length}/500
                    </p>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">💭</div>
                      <p className="text-gray-500 text-lg">첫 번째 댓글을 작성해보세요!</p>
                    </div>
                  ) : (
                    <div>
                      {renderComments(null)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 댓글 아래 광고 */}
            <div className="mt-6">
              <AdSlot position="bottom" />
            </div>
          </div>
          
          {/* 오른쪽: 사이드바 */}
          <div className="w-80 flex-shrink-0">
            <div className="space-y-6">
              {/* 사이드바 광고 */}
              <AdSlot position="sidebar" />

              {/* 실시간 인기글 */}
              <div className="p-0">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3 flex items-center gap-2">
                  실시간 인기글
                  <FontAwesomeIcon icon={faComment} />
                </h3>
                <div>
                  {samplePosts
                    .filter(p => p.id !== post.id)
                    .sort((a, b) => b.view_count - a.view_count)
                    .slice(0, 5)
                    .map((hotPost, idx) => (
                      <Link
                        key={hotPost.id}
                        href={`/post/${hotPost.id}`}
                        className={`block p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm${idx !== 0 ? ' mt-1' : ''}`}
                      >
                        <h4 className="font-semibold text-gray-900 text-sm truncate mb-0.5 leading-relaxed">
                          {hotPost.title}
                        </h4>
                        <div className="text-xs text-gray-500">
                          {hotPost.nickname} · {new Date(hotPost.created_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')} · 💬 {hotPost.comment_count}
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showCommentToast && (
        <div className="mt-2 text-center text-sm text-green-600 font-semibold animate-fade-in">댓글이 작성되었습니다!</div>
      )}
      {/* 비밀번호 입력 모달 */}
      {pwModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs mx-auto flex flex-col gap-3 animate-fade-in">
            <div className="text-lg font-semibold text-gray-800 mb-2 text-center">
              {pwModal.mode === 'edit' ? '게시글 수정' : '게시글 삭제'}<br />
              <span className="text-xs text-gray-400">비밀번호를 입력하세요</span>
            </div>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') { document.getElementById('pw-modal-confirm')?.click(); } }}
              autoFocus
              placeholder="비밀번호"
            />
            {pwError && <div className="text-xs text-red-500 text-center">{pwError}</div>}
            <div className="flex gap-2 justify-end mt-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-semibold transition-colors"
                onClick={() => setPwModal({mode: null, open: false})}
              >취소</button>
              <button
                id="pw-modal-confirm"
                className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold transition-colors ${!pwInput ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!pwInput}
                onClick={async () => {
                  if (pwInput !== post?.password) {
                    setPwError('비밀번호가 일치하지 않습니다.');
                    return;
                  }
                  setPwError('');
                  setPwModal({ ...pwModal, open: false });
                  if (pwModal.mode === 'edit') {
                    setEditForm({
                      title: post.title,
                      content: post.content,
                      nickname: post.nickname,
                      category: post.category,
                      images: post.images || '',
                    });
                    setIsEditing(true);
                  } else if (pwModal.mode === 'delete') {
                    const { error } = await supabase.from('posts').delete().eq('id', postId);
                    if (!error) {
                      alert('게시글이 삭제되었습니다.');
                      window.location.href = '/';
                    } else {
                      alert('삭제 중 오류 발생: ' + error.message);
                    }
                  }
                }}
              >확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}