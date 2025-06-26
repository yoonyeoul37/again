'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { samplePosts, sampleComments } from '@/data/sampleData';
import { Post, Comment, CommentFormData } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import AdSlot from '@/components/AdSlot';
import { useAuth } from '@/components/AuthProvider';

// 지역별 광고 데이터 (메인 페이지와 동일)
const regionAds = {
  '송파구': { image: '/ad-songpa.jpg', text: '송파구 법무사 무료상담 ☎ 02-1234-5678' },
  '강남구': { image: '/ad-gangnam.jpg', text: '강남구 법무사 무료상담 ☎ 02-2345-6789' },
  default: { image: '/001.jpg', text: '전국 법무사 무료상담 ☎ 1588-0000' }
};

function useRegionAd() {
  const [ad, setAd] = useState(regionAds.default);
  const [actualAds, setActualAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 광고 데이터 가져오기
    async function fetchAds() {
      try {
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('status', 'active')
          .gte('start_date', new Date().toISOString().split('T')[0])
          .lte('end_date', new Date().toISOString().split('T')[0])
          .order('created_at', { ascending: false });

        if (error) {
          console.error('광고 로드 실패:', error);
        } else {
          setActualAds(data || []);
        }
      } catch (error) {
        console.error('광고 로드 중 오류:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAds();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      // 카카오 REST API Key 필요! 아래 YOUR_REST_API_KEY를 발급받은 키로 교체하세요.
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${longitude}&y=${latitude}`,
        { headers: { Authorization: 'KakaoAK YOUR_REST_API_KEY' } }
      );
      const data = await res.json();
      const regionName = data.documents?.[0]?.region_2depth_name || '';
      setAd(regionAds[regionName] || regionAds.default);
    }, () => {
      setAd(regionAds.default);
    });
  }, []);

  return { ad, actualAds, loading };
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { ad, actualAds, loading } = useRegionAd();
  const { user } = useAuth(); // 관리자 권한 확인용

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentForm, setCommentForm] = useState<CommentFormData>({
    nickname: '',
    password: '',
    content: '',
  });
  const [replyForm, setReplyForm] = useState<{ [key: string]: { nickname: string; password: string; content: string } }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentToast, setShowCommentToast] = useState(false);
  const [cheered, setCheered] = useState(false);
  const [pwModal, setPwModal] = useState<{mode: 'edit' | 'delete' | null, open: boolean}>({mode: null, open: false});
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    nickname: '',
    category: '',
    images: '',
  });

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (error) {
          console.error('게시글 로드 실패:', error);
          // 샘플 데이터에서 찾기
          const samplePost = samplePosts.find(p => p.id === postId);
          if (samplePost) {
            setPost(samplePost);
          } else {
            alert('게시글을 찾을 수 없습니다.');
            router.push('/');
          }
        } else {
          setPost(data);
        }
      } catch (error) {
        console.error('게시글 로드 중 오류:', error);
      }
    }

    if (postId) {
      fetchPost();
    }
  }, [postId, router]);

  // 댓글 목록 가져오기 함수
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('댓글 로드 실패:', error);
        // 샘플 댓글 사용
        const sampleCommentsForPost = sampleComments.filter(c => c.post_id === postId);
        setComments(sampleCommentsForPost);
      } else {
        setComments(data || []);
      }
    } catch (error) {
      console.error('댓글 로드 중 오류:', error);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newComment = {
        post_id: postId,
        parent_id: null,
        nickname: commentForm.nickname,
        password: commentForm.password,
        content: commentForm.content,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([newComment])
        .select()
        .single();

      if (error) {
        console.error('댓글 작성 실패:', error);
        // 로컬에 추가
        const localComment: Comment = {
          id: Date.now().toString(),
          post_id: postId,
          parent_id: null,
          nickname: commentForm.nickname,
          password: commentForm.password,
          content: commentForm.content,
          created_at: new Date().toISOString(),
          replies: [],
        };
        setComments(prev => [...prev, localComment]);
      } else {
        setComments(prev => [...prev, data]);
        // 댓글 개수 증가: posts 테이블의 comment_count 필드 +1
        await supabase
          .from('posts')
          .update({ comment_count: (post?.comment_count || 0) + 1 })
          .eq('id', postId);
        // UI에도 즉시 반영
        setPost(prev => prev ? { ...prev, comment_count: (prev.comment_count || 0) + 1 } : prev);
        // 댓글 목록 다시 불러오기
        await fetchComments();
      }

      setCommentForm({ nickname: '', password: '', content: '' });
      setShowCommentToast(true);
      setTimeout(() => setShowCommentToast(false), 3000);
    } catch (error) {
      console.error('댓글 작성 중 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({ ...prev, [name]: value }));
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '자유': 'bg-blue-100 text-blue-800',
      '질문': 'bg-green-100 text-green-800',
      '정보': 'bg-purple-100 text-purple-800',
      '공지': 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleDeleteComment = (id: string) => {
    if (confirm('댓글을 삭제하시겠습니까?')) {
      setComments(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleEditComment = (id: string, content: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, content, isEditing: true } : c));
  };

  const handleSaveEdit = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, isEditing: false } : c));
  };

  const handleCancelEdit = () => {
    setComments(prev => prev.map(c => ({ ...c, isEditing: false })));
  };

  const handleReplyClick = (id: string) => {
    setReplyingTo(id);
    setReplyForm(prev => ({ ...prev, [id]: { nickname: '', password: '', content: '' } }));
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleReplyInputChange = (commentId: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReplyForm(prev => ({
      ...prev,
      [commentId]: { ...prev[commentId], [name]: value }
    }));
  };

  const handleReplySubmit = async (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    const replyData = replyForm[commentId];
    if (!replyData) return;

    try {
      const newReply = {
        post_id: postId,
        parent_id: commentId,
        nickname: replyData.nickname,
        password: replyData.password,
        content: replyData.content,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('comments')
        .insert([newReply])
        .select()
        .single();

      if (error) {
        console.error('답글 작성 실패:', error);
        // 로컬에 추가
        const localReply: Comment = {
          id: Date.now().toString(),
          post_id: postId,
          parent_id: commentId,
          nickname: replyData.nickname,
          password: replyData.password,
          content: replyData.content,
          created_at: new Date().toISOString(),
        };
        setComments(prev => prev.map(c => 
          c.id === commentId 
            ? { ...c, replies: [...(c.replies || []), localReply] }
            : c
        ));
      } else {
        setComments(prev => prev.map(c => 
          c.id === commentId 
            ? { ...c, replies: [...(c.replies || []), data] }
            : c
        ));
        // 대댓글 개수 증가: posts 테이블의 comment_count 필드 +1
        await supabase
          .from('posts')
          .update({ comment_count: (post?.comment_count || 0) + 1 })
          .eq('id', postId);
        // UI에도 즉시 반영
        setPost(prev => prev ? { ...prev, comment_count: (prev.comment_count || 0) + 1 } : prev);
        // 댓글 목록 다시 불러오기
        await fetchComments();
      }

      setReplyForm(prev => {
        const newForm = { ...prev };
        delete newForm[commentId];
        return newForm;
      });
      setReplyingTo(null);
    } catch (error) {
      console.error('답글 작성 중 오류:', error);
    }
  };

  const handleCheer = async () => {
    if (!post) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes: (post.likes || 0) + 1 })
        .eq('id', postId);

      if (!error) {
        setPost(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
        setCheered(true);
      }
    } catch (error) {
      console.error('힘내 버튼 오류:', error);
    }
  };

  // 실제 광고 중에서 랜덤하게 선택
  const getRandomAd = () => {
    if (actualAds.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * actualAds.length);
    return actualAds[randomIndex];
  };

  const randomAd = getRandomAd();

  // 관리자용 게시글 삭제 함수
  const handleAdminDeletePost = async () => {
    if (!user || user.role !== 'admin') return;
    
    if (confirm('관리자 권한으로 이 게시글을 삭제하시겠습니까?')) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) {
          console.error('게시글 삭제 실패:', error);
          alert('게시글 삭제 중 오류가 발생했습니다.');
        } else {
          alert('게시글이 삭제되었습니다.');
          router.push('/board');
        }
      } catch (error) {
        console.error('게시글 삭제 중 오류:', error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 관리자용 댓글 삭제 함수
  const handleAdminDeleteComment = async (commentId: string) => {
    if (!user || user.role !== 'admin') return;
    
    if (confirm('관리자 권한으로 이 댓글을 삭제하시겠습니까?')) {
      try {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);

        if (error) {
          console.error('댓글 삭제 실패:', error);
          alert('댓글 삭제 중 오류가 발생했습니다.');
        } else {
          // 댓글 개수 감소
          await supabase
            .from('posts')
            .update({ comment_count: Math.max((post?.comment_count || 0) - 1, 0) })
            .eq('id', postId);
          
          // UI 업데이트
          setComments(prev => prev.filter(c => c.id !== commentId));
          setPost(prev => prev ? { ...prev, comment_count: Math.max((prev.comment_count || 0) - 1, 0) } : prev);
          alert('댓글이 삭제되었습니다.');
        }
      } catch (error) {
        console.error('댓글 삭제 중 오류:', error);
        alert('댓글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  function renderCommentsFlat() {
    // 재귀적으로 댓글을 렌더링하는 함수
    const renderComment = (comment: Comment, depth: number = 0) => {
      const replies = comments.filter(c => c.parent_id === comment.id);
      const indentClass = depth > 0 ? `ml-${Math.min(depth * 6, 24)}` : '';
      return (
        <div key={comment.id} className={`${indentClass} ${depth > 0 ? 'mt-2' : 'mb-4'}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className="font-semibold text-gray-800 text-xs mr-2">{comment.nickname}</span>
              <span className="text-xs text-gray-400 mr-2">{new Date(comment.created_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')}</span>
              <span className="text-sm text-gray-700 align-middle">
                {depth > 0 && (() => {
                  const parent = comments.find(c => c.id === comment.parent_id);
                  return parent ? <span className="text-blue-600 font-semibold mr-1">@{parent.nickname}</span> : null;
                })()}
                {comment.content}
              </span>
            </div>
            <div className="flex gap-1 items-center flex-shrink-0">
              <button onClick={() => handleReplyClick(comment.id)} className="text-xs text-gray-500 hover:underline px-1 py-0.5">답글</button>
              <button onClick={() => handleEditComment(comment.id, comment.content)} className="text-xs text-gray-500 hover:underline px-1 py-0.5">수정</button>
              <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-gray-500 hover:underline px-1 py-0.5">삭제</button>
              {/* 관리자용 댓글 삭제 버튼 */}
              {user?.role === 'admin' && (
                <button 
                  onClick={() => handleAdminDeleteComment(comment.id)} 
                  className="text-xs text-red-600 hover:text-red-800 font-bold px-1 py-0.5 border border-red-300 rounded"
                  title="관리자 삭제"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
          {comment.isEditing ? (
            <div className="space-y-2 mt-1">
              <textarea
                value={comment.content}
                onChange={(e) => setComments(prev => prev.map(c => c.id === comment.id ? { ...c, content: e.target.value } : c))}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                rows={2}
              />
              <div className="flex gap-2">
                <button onClick={() => handleSaveEdit(comment.id)} className="px-2 py-1 text-xs text-blue-600 hover:underline">저장</button>
                <button onClick={handleCancelEdit} className="px-2 py-1 text-xs text-gray-500 hover:underline">취소</button>
              </div>
            </div>
          ) : null}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleReplySubmit(comment.id, e)} className="mt-2">
              <div className="inline-flex items-center mb-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700 font-semibold shadow-sm">
                💬 <span className="ml-1">@{comment.nickname}님에게 답글 작성 중</span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  name="nickname"
                  value={replyForm[comment.id]?.nickname || ''}
                  onChange={(e) => handleReplyInputChange(comment.id, e)}
                  placeholder="닉네임"
                  className="w-24 h-8 px-2 text-xs border border-gray-300 rounded"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={replyForm[comment.id]?.password || ''}
                  onChange={(e) => handleReplyInputChange(comment.id, e)}
                  placeholder="비밀번호"
                  className="w-24 h-8 px-2 text-xs border border-gray-300 rounded"
                  required
                />
                <textarea
                  name="content"
                  value={replyForm[comment.id]?.content || ''}
                  onChange={(e) => handleReplyInputChange(comment.id, e)}
                  placeholder="답글을 입력하세요..."
                  className="flex-1 p-2 text-xs border border-gray-300 rounded resize-none"
                  rows={2}
                  required
                />
                <button type="submit" className="px-2 py-1 text-xs text-blue-600 hover:underline">등록</button>
                <button type="button" onClick={handleCancelReply} className="px-2 py-1 text-xs text-gray-500 hover:underline">취소</button>
              </div>
            </form>
          )}
          {/* 재귀적으로 답글들 렌더링 */}
          {replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      );
    };
    // 최상위 댓글들만 렌더링 (parent_id가 null인 것들)
    return comments
      .filter(comment => !comment.parent_id)
      .map(comment => renderComment(comment));
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* 왼쪽: 메인 컨텐츠 */}
          <div className="flex-1">
            {/* 게시글 상단 광고 */}
            <div className="mb-6">
              {!loading && randomAd ? (
                // 실제 광고주가 등록한 광고
                <div className="w-full relative overflow-hidden rounded-xl shadow-lg">
                  {randomAd.image_url ? (
                    <div
                      className="w-full h-32 bg-cover bg-center relative"
                      style={{
                        backgroundImage: `url('${randomAd.image_url}')`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black/50" />
                      <div className="relative z-10 flex flex-col items-center justify-center h-full py-4 text-white text-center">
                        <h3 className="text-lg font-bold drop-shadow-lg mb-1">{randomAd.title}</h3>
                        <p className="text-sm drop-shadow-lg mb-1">{randomAd.description}</p>
                        <div className="text-xs drop-shadow-lg">
                          {randomAd.advertiser} | ☎ {randomAd.phone}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <h3 className="text-lg font-bold mb-1">{randomAd.title}</h3>
                        <p className="text-sm mb-1">{randomAd.description}</p>
                        <div className="text-xs">
                          {randomAd.advertiser} | ☎ {randomAd.phone}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // 기본 지역별 광고
                <div
                  className="w-full relative overflow-hidden rounded-xl shadow-lg"
                  style={{
                    backgroundImage: `url('${ad.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '128px'
                  }}
                >
                  <div className="absolute inset-0 bg-black/50" />
                  <div className="relative z-10 flex flex-col items-center justify-center h-full py-4 text-white text-center">
                    <span className="text-xl font-bold drop-shadow-lg">{ad.text}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 게시글 내용 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
              <div className="p-8">
                {/* 게시글 헤더 */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                      {post.isNotice && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          공지
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-relaxed">
                      {post.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{post.nickname}</span>
                      <span>{new Date(post.created_at).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      <span>👁️ {post.view_count.toLocaleString()}</span>
                      <span>💬 {post.comment_count}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPwModal({mode: 'edit', open: true})}
                      className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-xs font-medium"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => setPwModal({mode: 'delete', open: true})}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-xs font-medium"
                    >
                      삭제
                    </button>
                    {/* 관리자용 게시글 삭제 버튼 */}
                    {user?.role === 'admin' && (
                      <button
                        onClick={handleAdminDeletePost}
                        className="px-3 py-1.5 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors text-xs font-medium border-2 border-red-300"
                        title="관리자 삭제"
                      >
                        🗑️ 관리자삭제
                      </button>
                    )}
                  </div>
                </div>

                {/* 게시글 본문 */}
                {isEditing ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const { error } = await supabase
                      .from('posts')
                      .update({
                        title: editForm.title,
                        content: editForm.content,
                        category: editForm.category,
                        images: editForm.images,
                      })
                      .eq('id', postId);
                    
                    if (!error) {
                      setPost(prev => prev ? { ...prev, ...editForm } : null);
                      setIsEditing(false);
                    } else {
                      alert('수정 중 오류 발생: ' + error.message);
                    }
                  }} className="space-y-4">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="제목"
                      required
                    />
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="자유">자유</option>
                      <option value="질문">질문</option>
                      <option value="정보">정보</option>
                      <option value="공지">공지</option>
                    </select>
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="내용"
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                      {post.content}
                    </p>
                    {post.images && (
                      <div className="mt-6">
                        <img src={post.images} alt="게시글 이미지" className="max-w-full h-auto rounded-lg" />
                      </div>
                    )}
                    
                    {/* 힘내 버튼 */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
                      <div className="text-center">
                        <button
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
                  </div>
                )}
              </div>
            </div>

            {/* 광고 (728x90, AdSlot position='content') */}
            <div className="my-6">
              {!loading && actualAds.length > 1 ? (
                (() => {
                  const secondAd = actualAds[1];
                  return (
                    <div className="w-full relative overflow-hidden rounded-xl shadow-lg">
                      {secondAd.image_url ? (
                        <div
                          className="w-full h-32 bg-cover bg-center relative"
                          style={{
                            backgroundImage: `url('${secondAd.image_url}')`,
                          }}
                        >
                          <div className="absolute inset-0 bg-black/50" />
                          <div className="relative z-10 flex flex-col items-center justify-center h-full py-4 text-white text-center">
                            <h3 className="text-lg font-bold drop-shadow-lg mb-1">{secondAd.title}</h3>
                            <p className="text-sm drop-shadow-lg mb-1">{secondAd.description}</p>
                            <div className="text-xs drop-shadow-lg">
                              {secondAd.advertiser} | ☎ {secondAd.phone}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg flex items-center justify-center">
                          <div className="text-white text-center">
                            <h3 className="text-lg font-bold mb-1">{secondAd.title}</h3>
                            <p className="text-sm mb-1">{secondAd.description}</p>
                            <div className="text-xs">
                              {secondAd.advertiser} | ☎ {secondAd.phone}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="w-full relative overflow-hidden rounded-xl shadow-lg">
                  {/* 광고 자리 */}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-8">
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-700 mb-6">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2m4-4v4m0 0l-2-2m2 2l2-2" /></svg>
                  <span className="text-sm font-normal text-gray-500">💬 댓글 {comments.length}</span>
                </h3>
                
                {/* 댓글 작성 폼 */}
                <div className="mb-6">
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
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
                  </form>
                </div>
                
                {/* Comments List */}
                <div className="space-y-6">
                  {comments.length === 0 ? (
                    <>
                      <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">💭</div>
                        <p className="text-gray-500 text-lg">첫 번째 댓글을 작성해보세요!</p>
                      </div>
                      {/* 광고 */}
                      <div className="my-6">
                        <AdSlot position="content" />
                      </div>
                    </>
                  ) : (
                    <div>
                      {renderCommentsFlat()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 사이드바 */}
          <div className="w-80 flex-shrink-0">
            <div className="space-y-6">
              {/* 사이드바 광고 */}
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
              {/* 구글 광고 자리 */}
              <div className="mt-6">
                <AdSlot position="sidebar" />
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