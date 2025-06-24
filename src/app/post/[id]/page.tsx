'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { samplePosts, sampleComments } from '@/data/sampleData';
import { Post, Comment, CommentFormData } from '@/types';
import AdSlot from '@/components/AdSlot';

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
  const [commentForm, setCommentForm] = useState({ content: '', nickname: '' });
  const [replyForm, setReplyForm] = useState<{ [key: string]: { content: string; nickname: string } }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [cheerCount, setCheerCount] = useState(0);
  const [cheered, setCheered] = useState(false);
  const [showCommentToast, setShowCommentToast] = useState(false);

  useEffect(() => {
    // 실제로는 API 호출
    const foundPost = samplePosts.find(p => p.id === postId);
    if (foundPost) {
      setPost(foundPost);
      // 조회수 증가 (실제로는 API 호출)
      setPost(prev => prev ? { ...prev, viewCount: prev.viewCount + 1 } : null);
    } else {
      // router.push('/board'); // 삭제
    }

    // 댓글 로드
    const postComments = sampleComments.filter(c => c.postId === postId);
    setComments(postComments);
  }, [postId, router]);

  // 게시글별 힘내 중복 방지 (로컬스토리지)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = `cheered_${postId}`;
      if (localStorage.getItem(key)) {
        setCheered(true);
      }
    }
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.content.trim() || !commentForm.nickname.trim()) {
      setShowCommentToast(true);
      setTimeout(() => setShowCommentToast(false), 2000);
      return;
    }
    setIsSubmitting(true);
    try {
      const newComment: Comment = {
        id: Date.now().toString(),
        postId,
        content: commentForm.content,
        nickname: commentForm.nickname,
        createdAt: new Date().toISOString(),
        parentId: replyTo
      };
      
      // 디버깅: 새 댓글 데이터 확인
      console.log('새 댓글 작성:', newComment);
      
      setComments(prev => [newComment, ...prev]);
      setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
      setCommentForm({ content: '', nickname: '' });
      setReplyTo(null);
      setShowCommentToast(true);
      setTimeout(() => setShowCommentToast(false), 2000);
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
      const newComment: Comment = {
        id: Date.now().toString(),
        postId,
        content: form.content,
        nickname: form.nickname,
        createdAt: new Date().toISOString(),
        parentId: commentId
      };
      setComments(prev => [newComment, ...prev]);
      setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
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

  // 대댓글 트리 렌더링 함수
  function renderComments(parentId: string | null = null, depth = 0) {
    return comments
      .filter(c => c.parentId === parentId)
      .map(comment => {
        const isReply = !!comment.parentId;
        const parentComment = isReply ? comments.find(c => c.id === comment.parentId) : null;
        
        // 디버깅: 댓글 데이터 확인
        console.log('댓글 렌더링:', {
          id: comment.id,
          nickname: comment.nickname,
          content: comment.content,
          isReply
        });
        
        return (
          <div
            key={comment.id}
            className="w-full"
            style={{
              borderTop: isReply ? '1px dashed #ddd' : 'none',
              padding: isReply ? '8px 0 0 0' : '0',
              marginLeft: 0,
              background: 'none',
              boxShadow: 'none',
              borderRadius: 0
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isReply ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>{isReply ? '답글' : '댓글'}</span>
              {isReply && parentComment && (
                <span className="text-xs text-blue-700">↳ @{parentComment.nickname}</span>
              )}
              <span className="font-bold text-gray-900 text-[15px]">
                {comment.nickname || '익명'} {/* 닉네임이 없으면 '익명' 표시 */}
              </span>
              <span className="text-xs text-gray-400 ml-2">{new Date(comment.createdAt).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}</span>
            </div>
            <div className="flex flex-col gap-1">
              {editingCommentId === comment.id ? (
                <>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => handleSaveEdit(comment.id)} className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-xs font-semibold">저장</button>
                    <button type="button" onClick={handleCancelEdit} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-xs font-semibold">취소</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-800 text-[14px] whitespace-pre-wrap mb-1">{comment.content}</p>
                  <div className="flex gap-1 justify-end mt-1">
                    <button type="button" onClick={() => handleEditComment(comment.id, comment.content)} className="text-xs text-blue-600 hover:underline px-2 py-1 rounded-full font-semibold">수정</button>
                    <button type="button" onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-500 hover:underline px-2 py-1 rounded-full font-semibold">삭제</button>
                    <button type="button" onClick={() => handleReplyClick(comment.id)} className="text-xs text-green-600 hover:underline px-2 py-1 rounded-full font-semibold">답글</button>
                  </div>
                </>
              )}
            </div>
            {/* 대댓글 작성 폼 */}
            {replyTo === comment.id && (
              <form onSubmit={e => handleReplySubmit(comment.id, e)} className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="nickname"
                      value={replyForm[comment.id]?.nickname || ''}
                      onChange={e => handleReplyInputChange(comment.id, e)}
                      placeholder="닉네임"
                      className="w-32 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                      maxLength={20}
                    />
                    <textarea
                      name="content"
                      value={replyForm[comment.id]?.content || ''}
                      onChange={e => handleReplyInputChange(comment.id, e)}
                      placeholder="답글을 입력하세요..."
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                      required
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? '작성 중...' : '등록'}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {(replyForm[comment.id]?.content || '').length}/500
                    </p>
                    <button
                      type="button"
                      onClick={handleCancelReply}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </form>
            )}
            {/* 대댓글 렌더링 (무한 단계 허용) */}
            {renderComments(comment.id, depth + 1)}
          </div>
        );
      });
  }

  const handleCheer = () => {
    if (cheered) return;
    setCheerCount(c => c + 1);
    setCheered(true);
    if (typeof window !== 'undefined') {
      const key = `cheered_${postId}`;
      localStorage.setItem(key, '1');
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
          <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* 2단 레이아웃: 게시글 + 사이드바 */}
        <div className="flex gap-6">
          {/* 왼쪽: 게시글 + 댓글 */}
          <div className="flex-1">
            {/* Post Content */}
            <article className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-6">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    [{post.category}]
                  </span>
                  <div className="text-sm text-gray-500">
                    <div className="text-gray-400 text-xs">{new Date(post.createdAt).getFullYear()}</div>
                    <div>{new Date(post.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</div>
                  </div>
                </div>

                {/* Post Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>

                {/* Post Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-4 border-b">
                  <span className="font-medium text-gray-700">{post.nickname}</span>
                  <div className="flex items-center space-x-4">
                    <span>👁️ {post.viewCount}</span>
                    <span>💬 {post.commentCount}</span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm" style={{ fontSize: '15px' }}>
                    {post.content}
                  </p>
                </div>

                {/* 힘내(엄지) 버튼 */}
                <div className="flex flex-col items-center justify-center mt-6">
                  <button
                    type="button"
                    onClick={handleCheer}
                    disabled={cheered}
                    className={`flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-colors text-sm font-bold ${cheered ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-lg">👍</span>
                    <span>힘내</span>
                    <span className="ml-1 text-xs font-semibold">{cheerCount}</span>
                  </button>
                  {cheered && (
                    <span className="mt-2 text-xs text-gray-500">이미 힘내를 눌렀어요!</span>
                  )}
                </div>
              </div>
            </article>

            {/* 게시글 아래 광고 */}
            <div className="mb-6">
              <AdSlot position="content" />
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  댓글 ({comments.length})
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="nickname"
                        value={commentForm.nickname}
                        onChange={handleInputChange}
                        placeholder="닉네임"
                        className="w-32 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                        maxLength={20}
                      />
                      <textarea
                        name="content"
                        value={commentForm.content}
                        onChange={handleInputChange}
                        placeholder="댓글을 입력하세요..."
                        rows={2}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                        required
                        maxLength={500}
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-4xl mb-2">💬</div>
                      <p className="text-gray-500">첫 번째 댓글을 작성해보세요!</p>
                    </div>
                  ) : (
                    renderComments(null, 0)
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
          <div className="w-64 flex-shrink-0">
            <div className="space-y-6">
              {/* 사이드바 광고 */}
              <AdSlot position="sidebar" />

              {/* Related Posts */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">관련 글</h3>
                <div className="space-y-3">
                  {samplePosts
                    .filter(p => p.category === post.category && p.id !== post.id)
                    .slice(0, 3)
                    .map((relatedPost) => (
                      <Link 
                        key={relatedPost.id} 
                        href={`/post/${relatedPost.id}`}
                        className="block p-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                          {relatedPost.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{relatedPost.nickname}</span>
                          <div>
                            <div className="text-gray-400 text-xs">{new Date(relatedPost.createdAt).getFullYear()}</div>
                            <div>{new Date(relatedPost.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Category Info */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">카테고리 정보</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  {post.category === '개인회생' && (
                    <>
                      <p>• 개인회생은 부채 문제를 해결하는 법적 절차입니다</p>
                      <p>• 신용회복위원회를 통해 진행됩니다</p>
                      <p>• 전문가 상담을 권장합니다</p>
                    </>
                  )}
                  {post.category === '이혼상담' && (
                    <>
                      <p>• 이혼은 신중한 결정이 필요한 문제입니다</p>
                      <p>• 법적 절차와 재산 분할을 고려해야 합니다</p>
                      <p>• 전문가 상담을 권장합니다</p>
                    </>
                  )}
                  {post.category === '법인파산' && (
                    <>
                      <p>• 법인파산은 법인(회사)의 부채 문제를 해결하는 법적 절차입니다</p>
                      <p>• 법원에 파산 신청을 통해 진행됩니다</p>
                      <p>• 전문가 상담을 권장합니다</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* 왼쪽: 링크들 */}
            <div className="flex items-center gap-6 text-sm">
              <Link href="/advertising" className="text-gray-600 hover:text-blue-600 transition-colors">
                광고문의
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                이용약관
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                개인정보처리방침
              </Link>
            </div>
            
            {/* 오른쪽: 저작권 */}
            <div className="text-sm text-gray-500">
              © 2024 회생파산 커뮤니티. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {showCommentToast && (
        <div className="mt-2 text-center text-sm text-green-600 font-semibold animate-fade-in">댓글이 작성되었습니다!</div>
      )}
    </div>
  );
} 