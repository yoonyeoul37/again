'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PostFormData } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/AuthProvider';

export default function WritePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    nickname: '',
    category: '개인회생',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isNotice, setIsNotice] = useState(false);

  const bannedWords = [
    "법무사", "변호사", "사무소", "사무실", "로펌", "법률", "법률사무소",
    "씨발", "ㅅㅂ", "개새", "병신", "좆", "엿", "썅", "fuck", "shit"
  ];
  function isNicknameAllowed(nickname: string) {
    const lowerNickname = nickname.toLowerCase().replace(/\s/g, "");
    return !bannedWords.some(word => lowerNickname.includes(word.toLowerCase()));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 5) {
      alert('이미지는 최대 5개까지 첨부할 수 있습니다.');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
    });

    const newImages = [...images, ...files];
    setImages(newImages);

    // 미리보기 생성
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.nickname.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (!isNicknameAllowed(formData.nickname)) {
      alert('닉네임에 법무사/변호사/사무실 등 홍보성 단어를 사용할 수 없습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 이미지 업로드 처리
      let imageUrls: string[] = [];
      
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${i}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('post-images')
            .upload(fileName, file);
          
          if (uploadError) {
            console.error('이미지 업로드 실패:', uploadError);
            alert('이미지 업로드에 실패했습니다.');
            setIsSubmitting(false);
            return;
          }
          
          // 공개 URL 생성
          const { data: urlData } = supabase.storage
            .from('post-images')
            .getPublicUrl(fileName);
          
          imageUrls.push(urlData.publicUrl);
        }
      }

      // 게시글 저장
      const { error, data } = await supabase.from('posts').insert([
        {
          title: formData.title,
          content: formData.content,
          nickname: formData.nickname,
          category: formData.category,
          created_at: new Date().toISOString(),
          view_count: 0,
          comment_count: 0,
          images: imageUrls.join(','),
          password: formData.password,
          ...(user?.role === 'admin' ? { isNotice } : {})
        }
      ]).select();
      
      console.log('insert error:', error);
      console.log('insert data:', data);
      
      if (error) {
        alert('글 저장 실패: ' + error.message);
        setIsSubmitting(false);
      } else if (data && data.length > 0) {
        // 작성자 정보를 localStorage에 저장 (수정/삭제 권한용)
        const postId = data[0].id;
        const authorKey = `post_author_${postId}`;
        const writerKey = `post_writer_${formData.nickname}`;
        
        localStorage.setItem(authorKey, 'temp_author'); // 임시 작성자 표시
        localStorage.setItem(writerKey, 'true'); // 닉네임별 작성자 표시
        
        console.log('✅ 글 작성 완료:', data[0]);
        console.log('📝 작성자 정보 저장됨:', { authorKey, writerKey });
        
        alert('글이 성공적으로 작성되었습니다!');
        router.push(`/post/${data[0].id}`);
      } else {
        alert('글이 작성되었습니다!');
        console.log('📝 글 작성 완료, 메인으로 이동');
        // 강제 새로고침으로 확실하게 새 글이 보이도록 함
        setTimeout(() => {
          // 먼저 메인 페이지로 이동
          window.location.href = '/';
          // 그리고 페이지 로드 후 강제 새로고침
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }, 1500);
      }
    } catch (error) {
      console.error('글 작성 중 오류 발생:', error);
      alert('글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-2xl">🌟</div>
              <div>
                <div className="text-2xl font-bold">신복이</div>
                <div className="text-xs text-gray-300">💡 개인법인회생파산 정보공유</div>
              </div>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link href="/qa" className="text-white/80 hover:text-white text-sm transition-colors">
                Q&A
              </Link>
              <Link href="/news" className="text-white/80 hover:text-white text-sm transition-colors">
                뉴스
              </Link>
              <Link href="/rules" className="text-white/80 hover:text-white text-sm transition-colors">
                이용수칙
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                새 글 작성
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg">고민을 나누고 따뜻한 조언을 받아보세요 💝</p>
        </div>

        {/* Write Form (카드형) */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <label htmlFor="category" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                카테고리 선택
                <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-gray-800 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                required
              >
                <option value="개인회생">🏠 개인회생</option>
                <option value="개인파산">💸 개인파산</option>
                <option value="법인회생">🏢 법인회생</option>
                <option value="법인파산">🏪 법인파산</option>
                <option value="워크아웃">🔄 워크아웃</option>
                <option value="신용회복위원">📈 신용회복위원</option>
                <option value="대출">💰 대출관련</option>
                <option value="신용카드">💳 신용카드</option>
                <option value="신용점수">📊 신용점수</option>
                <option value="회생절차">📋 회생절차</option>
                <option value="상환계획">📅 상환계획</option>
                <option value="법무사상담">⚖️ 법무사상담</option>
                <option value="변호사상담">👨‍⚖️ 변호사상담</option>
                <option value="회생비용">💲 회생비용</option>
                <option value="파산비용">💸 파산비용</option>
                <option value="인가결정">✅ 인가결정</option>
                <option value="셀프신청">👤 셀프신청</option>
                <option value="개인신청">📝 개인신청</option>
                <option value="취업">👔 취업관련</option>
              </select>
            </div>

            {/* Title & Nickname - 나란히 배치 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                <label htmlFor="title" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  제목
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="제목을 입력해주세요"
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm text-gray-800 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  required
                  maxLength={100}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-emerald-600 font-medium">생생한 제목으로 관심을 끌어보세요</p>
                  <p className="text-xs text-gray-500 font-medium">{formData.title.length}/100</p>
                </div>
              </div>

              {/* Nickname */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                <label htmlFor="nickname" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  닉네임
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="닉네임을 입력해주세요"
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm text-gray-800 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  required
                  maxLength={8}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-purple-600 font-medium">익명으로 안전하게 소통하세요</p>
                  <p className="text-xs text-gray-500 font-medium">{formData.nickname.length}/8</p>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
              <label htmlFor="password" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                비밀번호
                <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="수정/삭제용 비밀번호 (4~20자)"
                className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80 backdrop-blur-sm text-gray-800 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                required
                minLength={4}
                maxLength={20}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-orange-600 font-medium">🔒 글 수정/삭제 시 필요한 비밀번호입니다</p>
                <p className="text-xs text-gray-500 font-medium">{formData.password.length}/20</p>
              </div>
            </div>

            {/* Content */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
              <label htmlFor="content" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
                내용 작성
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="고민이나 질문을 자세히 작성해주세요...

• 현재 상황을 구체적으로 설명해주세요
• 궁금한 점이나 도움이 필요한 부분을 명확히 해주세요
• 경험담이나 조언이 있으시면 공유해주세요"
                rows={12}
                className="w-full px-4 py-4 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 backdrop-blur-sm text-gray-800 font-medium shadow-sm hover:shadow-md transition-all duration-200 resize-none leading-relaxed"
                required
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-indigo-600 font-medium">💝 따뜻한 마음으로 고민을 나눠주세요</p>
                <p className="text-xs text-gray-500 font-medium">{formData.content.length}/2000</p>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-100">
              <label className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                이미지 첨부
                <span className="text-gray-500 text-sm font-normal">(선택사항)</span>
              </label>
              <div className="border-2 border-dashed border-pink-200 rounded-xl p-8 text-center bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200 hover:border-pink-300">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                      <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-gray-700 font-semibold mb-1">클릭하여 이미지 업로드</div>
                    <div className="text-sm text-pink-600 font-medium">📸 최대 5개, 각 5MB 이하</div>
                    <div className="text-xs text-gray-500 mt-2">JPG, PNG, GIF 파일을 업로드할 수 있습니다</div>
                  </div>
                </label>
                
                {/* 이미지 미리보기 */}
                {imagePreview.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-pink-200">
                    <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      첨부된 이미지 ({imagePreview.length}/5)
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`첨부 이미지 ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-pink-200 shadow-sm group-hover:shadow-md transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 duration-200"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 공지로 등록 (관리자만) */}
            {user?.role === 'admin' && (
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={isNotice}
                  onChange={e => setIsNotice(e.target.checked)}
                />
                공지로 등록
              </label>
            )}

            {/* 가이드라인 */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xl font-bold text-gray-800">글쓰기 가이드라인</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">구체적인 상황 설명</div>
                      <div className="text-xs text-gray-600">현재 상황과 고민을 자세히 설명해주세요</div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">개인정보 보호</div>
                      <div className="text-xs text-gray-600">개인정보나 연락처는 포함하지 마세요</div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">존중하는 소통</div>
                      <div className="text-xs text-gray-600">타인을 비방하거나 욕설을 사용하지 마세요</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">전문가 상담</div>
                      <div className="text-xs text-gray-600">법률 자문은 전문가에게 문의하시기 바랍니다</div>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">이미지 업로드</div>
                      <div className="text-xs text-gray-600">최대 5개까지, 각 5MB 이하로 첨부 가능</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  console.log('📝 글 작성 취소, 메인으로 이동');
                  window.location.href = '/';
                }}
                className="group px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-sm disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105 disabled:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                    </svg>
                    작성 중...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    글 작성하기
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 개인정보 안내 */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-lg font-bold text-amber-800">🔒 개인정보 보호 안내</div>
          </div>
          <div className="bg-white/60 rounded-lg p-4 border border-amber-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-amber-700">🛡️ 안전한 소통을 위해:</strong> 업로드된 이미지에는 개인정보가 포함되지 않도록 주의해주세요. 
              개인정보가 포함된 이미지는 관리자에 의해 즉시 삭제되며, 익명성 보장을 위해 개인을 식별할 수 있는 정보는 모두 제거됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 