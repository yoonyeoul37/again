'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { samplePosts, sampleComments } from '@/data/sampleData';
import { Post, Comment, CommentFormData } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faImage, faEye, faThumbsUp as faRegularThumbsUp, faUserPen, faTrash, faNoteSticky } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabaseClient';
import AdSlot from '@/components/AdSlot';
import { useAuth } from '@/components/AuthProvider';
import MainBoardList from '@/components/MainBoardList';
import BoardTable from '@/components/BoardTable';

function useRegionAd() {
  const [ad, setAd] = useState(null); // 기본값 null
  const [actualAds, setActualAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<string>('');

  // IP 기반 위치 감지 (무료 API)
  const getLocationByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      console.log('IP 기반 위치:', data);
      return data.city || data.region || '';
    } catch (error) {
      console.log('IP 기반 위치 감지 실패:', error);
      return '';
    }
  };

  // 위치 기반 광고 매칭
  const matchLocationToAd = (location: string) => {
    if (actualAds.length > 0) {
      const matchingAd = actualAds[0];
      return {
        image: matchingAd.image_url || '',
        text: `${matchingAd.title} - ${matchingAd.phone}`,
        advertiser: matchingAd.advertiser
      };
    }
    return null;
  };

  useEffect(() => {
    const initializeAds = async () => {
      // 1. 실제 광고 데이터 가져오기
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('ads')
          .select('*')
          .eq('status', 'active')
          // .gte('start_date', today)
          // .lte('end_date', today)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('광고 로드 실패:', error);
        } else {
          console.log('로드된 광고 데이터:', data);
          setActualAds(data || []);
        }
      } catch (error) {
        console.error('광고 로드 중 오류:', error);
      } finally {
        setLoading(false);
      }

      // 2. 위치 감지 및 광고 매칭
      const detectLocation = async () => {
        // 1. 브라우저 Geolocation 시도
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            console.log('GPS 위치:', latitude, longitude);
            
            // 임시로 하드코딩된 위치 매핑 (개발용)
            let detectedLocation = '';
            if (latitude > 37.5 && latitude < 37.7 && longitude > 126.9 && longitude < 127.1) {
              detectedLocation = '강남구'; // 서울 강남구 근처
            } else if (latitude > 37.4 && latitude < 37.6 && longitude > 126.7 && longitude < 126.9) {
              detectedLocation = '송파구'; // 서울 송파구 근처
            } else {
              detectedLocation = '서울'; // 기본값
            }
            
            setUserLocation(detectedLocation);
            const matchedAd = matchLocationToAd(detectedLocation);
            setAd(matchedAd);
          }, async (error) => {
            console.log('GPS 위치 감지 실패:', error);
            // 2. IP 기반 위치 감지로 폴백
            const ipLocation = await getLocationByIP();
            setUserLocation(ipLocation);
            const matchedAd = matchLocationToAd(ipLocation);
            setAd(matchedAd);
          });
        } else {
          // 3. IP 기반 위치 감지
          const ipLocation = await getLocationByIP();
          setUserLocation(ipLocation);
          const matchedAd = matchLocationToAd(ipLocation);
          setAd(matchedAd);
        }
      };

      // 광고 데이터 로드 후 위치 감지 실행
      detectLocation();
    };

    initializeAds();
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

  return { ad, actualAds, loading, userLocation };
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { ad, actualAds, loading, userLocation } = useRegionAd();
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

  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setPosts(data);
      }
    }
    fetchPosts();
  }, []);

  const noticePosts = posts.filter(post => post.isNotice);
  const normalPosts = posts.filter(post => !post.isNotice);
  const sortedPosts = [...noticePosts, ...normalPosts];
  const totalPages = Math.ceil(sortedPosts.length / PAGE_SIZE);
  const paginatedPosts = sortedPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function isNew(created_at: string) {
    const today = new Date();
    const created = new Date(created_at);
    return (
      created.getFullYear() === today.getFullYear() &&
      created.getMonth() === today.getMonth() &&
      created.getDate() === today.getDate()
    );
  }

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

  const handleDeleteComment = async (id: string) => {
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    const password = prompt('댓글 삭제를 위해 비밀번호를 입력하세요:');
    if (!password) return;
    
    if (password !== comment.password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (confirm('댓글을 삭제하시겠습니까?')) {
      try {
        // 해당 댓글의 답글들도 함께 삭제
        const replies = comments.filter(c => c.parent_id === id);
        const deleteIds = [id, ...replies.map(r => r.id)];
        
        const { error } = await supabase
          .from('comments')
          .delete()
          .in('id', deleteIds);

        if (error) {
          console.error('댓글 삭제 실패:', error);
          alert('댓글 삭제 중 오류가 발생했습니다.');
        } else {
          // 삭제된 댓글 + 답글 개수만큼 감소
          const deletedCount = deleteIds.length;
          await supabase
            .from('posts')
            .update({ comment_count: Math.max((post?.comment_count || 0) - deletedCount, 0) })
            .eq('id', postId);
          
          // UI 업데이트 - 삭제된 댓글과 답글들 모두 제거
          setComments(prev => prev.filter(c => !deleteIds.includes(c.id)));
          setPost(prev => prev ? { ...prev, comment_count: Math.max((prev.comment_count || 0) - deletedCount, 0) } : prev);
          alert(`댓글과 답글 ${deletedCount}개가 삭제되었습니다.`);
        }
      } catch (error) {
        console.error('댓글 삭제 중 오류:', error);
        alert('댓글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEditComment = async (id: string, content: string) => {
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    const password = prompt('댓글 수정을 위해 비밀번호를 입력하세요:');
    if (!password) return;
    
    if (password !== comment.password) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    setComments(prev => prev.map(c => c.id === id ? { ...c, content, isEditing: true } : c));
  };

  const handleSaveEdit = async (id: string) => {
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: comment.content })
        .eq('id', id);

      if (error) {
        console.error('댓글 수정 실패:', error);
        alert('댓글 수정 중 오류가 발생했습니다.');
      } else {
        setComments(prev => prev.map(c => c.id === id ? { ...c, isEditing: false } : c));
        alert('댓글이 수정되었습니다.');
      }
    } catch (error) {
      console.error('댓글 수정 중 오류:', error);
      alert('댓글 수정 중 오류가 발생했습니다.');
    }
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
          router.push('/');
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
        // 해당 댓글의 답글들도 함께 삭제
        const replies = comments.filter(c => c.parent_id === commentId);
        const deleteIds = [commentId, ...replies.map(r => r.id)];
        
        const { error } = await supabase
          .from('comments')
          .delete()
          .in('id', deleteIds);

        if (error) {
          console.error('댓글 삭제 실패:', error);
          alert('댓글 삭제 중 오류가 발생했습니다.');
        } else {
          // 삭제된 댓글 + 답글 개수만큼 감소
          const deletedCount = deleteIds.length;
          await supabase
            .from('posts')
            .update({ comment_count: Math.max((post?.comment_count || 0) - deletedCount, 0) })
            .eq('id', postId);
          
          // UI 업데이트 - 삭제된 댓글과 답글들 모두 제거
          setComments(prev => prev.filter(c => !deleteIds.includes(c.id)));
          setPost(prev => prev ? { ...prev, comment_count: Math.max((prev.comment_count || 0) - deletedCount, 0) } : prev);
          alert(`댓글과 답글 ${deletedCount}개가 삭제되었습니다.`);
        }
      } catch (error) {
        console.error('댓글 삭제 중 오류:', error);
        alert('댓글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 트리 구조로 댓글 렌더링
  function renderCommentTree(comment: Comment, depth: number = 0) {
    const replies = comments.filter(c => c.parent_id === comment.id);
    const parent = depth > 0 ? comments.find(c => c.id === comment.parent_id) : null;
    return (
      <div key={comment.id} className={`${depth > 0 ? `ml-${Math.min(depth * 6, 24)}` : ''} py-1`}>
        <div className="flex items-start">
          {depth > 0 && <span className="mr-2 text-gray-400">↳</span>}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm" style={{ color: '#FF8C00', fontWeight: 'normal' }}>{comment.nickname}</span>
                {depth > 0 && parent && <span className="text-blue-600 text-xs ml-1">@{parent.nickname}</span>}
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{new Date(comment.created_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')}</span>
              </div>
              <div className="flex gap-1 items-center flex-shrink-0">
                <button onClick={() => handleReplyClick(comment.id)} className="text-xs text-gray-500 hover:underline px-1 py-0.5">답글</button>
                <button onClick={() => handleEditComment(comment.id, comment.content)} className="text-xs text-gray-500 hover:underline px-1 py-0.5">수정</button>
                <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-gray-500 hover:underline px-1 py-0.5">삭제</button>
                {user?.role === 'admin' && (
                  <button onClick={() => handleAdminDeleteComment(comment.id)} className="text-xs text-red-600 hover:text-red-800 font-medium px-1 py-0.5 flex items-center gap-1" title="관리자 삭제">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    삭제
                  </button>
                )}
              </div>
            </div>
            <div className="text-gray-800 text-sm mb-1" style={{ color: '#333333', fontWeight: 'normal' }}>{comment.content}</div>
            {comment.isEditing ? (
              <div className="space-y-2 mt-1">
                <textarea
                  value={comment.content}
                  onChange={(e) => setComments(prev => prev.map(c => c.id === comment.id ? { ...c, content: e.target.value } : c))}
                  className="w-full p-3 border border-blue-200 rounded bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
                <div className="flex gap-2 mt-1">
                  <button onClick={() => handleSaveEdit(comment.id)} className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition">저장</button>
                  <button onClick={handleCancelEdit} className="px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition">취소</button>
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
                    autoComplete="off"
                  />
                  <input
                    type="password"
                    name="password"
                    value={replyForm[comment.id]?.password || ''}
                    onChange={(e) => handleReplyInputChange(comment.id, e)}
                    placeholder="비밀번호"
                    className="w-24 h-8 px-2 text-xs border border-gray-300 rounded"
                    required
                    autoComplete="new-password"
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
            {/* 대댓글 재귀 렌더링 */}
            {replies.map(reply => renderCommentTree(reply, depth + 1))}
          </div>
        </div>
      </div>
    );
  }
  // 최상위 댓글 트리별로 border-t, border-b로 묶어서 렌더링
  function renderCommentsFlat() {
    const topLevel = comments.filter(comment => !comment.parent_id);
    return (
      <div className="border rounded px-6 py-4" style={{ borderColor: '#e0e1db' }}>
        {topLevel.map((comment, idx) => (
          <div
            key={comment.id}
            className={`py-3 mt-4 relative`}
          >
            {renderCommentTree(comment)}
            {idx !== topLevel.length - 1 && (
              <div
                className="absolute left-4 right-4"
                style={{ borderBottom: '1px dashed #b2b2b2', top: '100%' }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // 랜덤 광고 선택 함수 - 위치 기반 우선순위 적용
  const getRandomAd = () => {
    if (!actualAds || actualAds.length === 0) return undefined;
    
    // 1. 사용자 위치에 맞는 광고들 필터링
    const locationBasedAds = actualAds.filter(ad => {
      if (!userLocation) return false;
      
      if (ad.ad_type === 'major') {
        // 대도시 전체 광고 매칭
        const majorCityMap: { [key: string]: string[] } = {
          'seoul': ['서울', '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
          'busan': ['부산', '강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구', '기장군'],
          'daegu': ['대구', '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
          'incheon': ['인천', '계양구', '남구', '남동구', '동구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
          'daejeon': ['대전', '대덕구', '동구', '서구', '유성구', '중구'],
          'gwangju': ['광주', '광산구', '남구', '동구', '북구', '서구'],
          'ulsan': ['울산', '남구', '동구', '북구', '울주군', '중구'],
          'sejong': ['세종', '세종특별자치시']
        };
        
        const cityRegions = majorCityMap[ad.major_city || ''] || [];
        return cityRegions.some(region => userLocation.includes(region));
      } else if (ad.ad_type === 'regional' && ad.regions) {
        // 중소도시/군 선택 광고 매칭
        const regionMap: { [key: string]: string } = {
          'suwon': '수원시', 'seongnam': '성남시', 'bucheon': '부천시', 'ansan': '안산시',
          'anyang': '안양시', 'pyeongtaek': '평택시', 'dongducheon': '동두천시',
          'uijeongbu': '의정부시', 'goyang': '고양시', 'gwangmyeong': '광명시',
          'gwangju_gyeonggi': '광주시', 'yongin': '용인시', 'paju': '파주시',
          'icheon': '이천시', 'anseong': '안성시', 'gimpo': '김포시',
          'hwaseong': '화성시', 'yangju': '양주시', 'pocheon': '포천시',
          'yeoju': '여주시', 'gapyeong': '가평군', 'yangpyeong': '양평군',
          'yeoncheon': '연천군'
        };
        
        return ad.regions.some(region => {
          const regionName = regionMap[region] || region;
          return userLocation.includes(regionName);
        });
      }
      return false;
    });
    
    // 2. 위치 기반 광고가 있으면 그 중에서 랜덤 선택
    if (locationBasedAds.length > 0) {
      const idx = Math.floor(Math.random() * locationBasedAds.length);
      console.log('위치 기반 광고 선택:', locationBasedAds[idx].title, '사용자 위치:', userLocation);
      return locationBasedAds[idx];
    }
    
    // 3. 위치 기반 광고가 없으면 전체 광고에서 랜덤 선택
    const idx = Math.floor(Math.random() * actualAds.length);
    console.log('전체 광고에서 랜덤 선택:', actualAds[idx].title);
    return actualAds[idx];
  };

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
            {/* 게시글 상단 광고 - 본문 위에 고정 */}
            <AdSlot position="content" ad={getRandomAd()} className="mb-6" />
            {/* 게시글 내용 */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-10 p-10">
              <div className="pb-8">
                {/* 게시글 헤더 */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-4 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>{post.category}</span>
                      {post.isNotice && (
                        <span className="px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">공지</span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-relaxed">{post.title}</h1>
                    <div className="flex items-center gap-6 text-base text-gray-500">
                      <span className="font-semibold text-gray-800">{post.nickname}</span>
                      <span className="text-gray-400">{new Date(post.created_at).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1 text-blue-700"><FontAwesomeIcon icon={faEye} /> {post.view_count ?? 0}</span>
                      <span className="flex items-center gap-1 text-blue-700"><FontAwesomeIcon icon={faComment} /> {post.comment_count ?? 0}</span>
                    </div>
                  </div>
                  {/* 수정/삭제 버튼 */}
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 hover:bg-gray-200 transition flex items-center gap-2"><FontAwesomeIcon icon={faUserPen} /> 수정</button>
                    <button className="rounded-lg bg-white text-red-600 border border-red-200 px-4 py-2 hover:bg-red-50 transition flex items-center gap-2"><FontAwesomeIcon icon={faTrash} /> 삭제</button>
                  </div>
                </div>
                <div className="text-lg text-gray-800 mb-8">{post.content}</div>
                <div className="flex justify-center">
                  <button className="rounded-full border border-gray-300 bg-gray-50 text-gray-800 px-8 py-3 text-lg font-semibold shadow hover:bg-gray-100 transition flex items-center gap-2">
                    <FontAwesomeIcon icon={faRegularThumbsUp} /> 힘내 {post.likes ?? 0}
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faComment} className="text-blue-600" />
                <span className="font-semibold text-gray-800">댓글 {comments.length}</span>
              </div>
              <form className="flex gap-2 mb-2" onSubmit={handleCommentSubmit}>
                <input className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition w-32" placeholder="닉네임" name="nickname" value={commentForm.nickname} onChange={handleInputChange} />
                <input className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition w-40" placeholder="비밀번호(수정/삭제용)" name="password" value={commentForm.password} onChange={handleInputChange} />
                <input className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition" placeholder="댓글을 입력하세요..." name="content" value={commentForm.content} onChange={handleInputChange} />
                <button className="rounded-lg bg-blue-600 text-white px-6 py-2 font-semibold hover:bg-blue-700 transition" type="submit">등록</button>
              </form>
            </div>
            
            {/* Comments List */}
            <div className="mt-6 pt-2">
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
          
          {/* 오른쪽: 사이드바 */}
          <div className="w-80 flex-shrink-0">
            <div className="space-y-6">
              {/* 사이드바 광고 */}
              <div className="p-0">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faNoteSticky} className="text-blue-600" />
                  실시간 인기글
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
                          {hotPost.nickname} · {new Date(hotPost.created_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\./g, '.').replace(/\s/g, '')} · 
                          <span className="text-blue-600 ml-1">
                            <FontAwesomeIcon icon={faEye} className="mr-1" />{hotPost.view_count ?? 0}
                          </span>
                          <span className="text-blue-600 ml-2">
                            <FontAwesomeIcon icon={faComment} className="mr-1" />{hotPost.comment_count ?? 0}
                          </span>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
              {/* 오른쪽: 사이드바 광고 */}
              <AdSlot position="sidebar" />
            </div>
          </div>
        </div>
      </div>
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
                    const { error } = await supabase.from('posts').delete().eq('id', post.id);
                    if (!error) {
                      alert('게시글이 삭제되었습니다.');
                      router.push('/');
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