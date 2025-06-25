'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PostFormData } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export default function WritePage() {
  const router = useRouter();
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
          comment_count: 0,
          images: imageUrls.join(','),
          password: formData.password
        }
      ]);
      
      console.log('insert error:', error);
      console.log('insert data:', data);
      
      if (error) {
        alert('글 저장 실패: ' + error.message);
        setIsSubmitting(false);
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('글 작성 중 오류 발생:', error);
      alert('글 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">글쓰기</h1>
          <p className="text-gray-400 text-base">익명으로 고민을 나누고 조언을 받아보세요</p>
        </div>

        {/* Write Form (카드형) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                말머리 선택 <span className="text-blue-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50"
                required
              >
                <option value="개인회생">[개인회생]</option>
                <option value="개인파산">[개인파산]</option>
                <option value="법인회생">[법인회생]</option>
                <option value="법인파산">[법인파산]</option>
                <option value="워크아웃">[워크아웃]</option>
                <option value="신용회복위원회">[신용회복위원회]</option>
                <option value="대출">[대출관련]</option>
                <option value="신용카드">[신용카드]</option>
                <option value="신용점수">[신용점수]</option>
                <option value="회생절차">[회생절차]</option>
                <option value="상환계획">[상환계획]</option>
                <option value="법무사상담">[법무사상담]</option>
                <option value="변호사상담">[변호사상담]</option>
                <option value="회생비용">[회생비용]</option>
                <option value="파산비용">[파산비용]</option>
                <option value="인가결정">[인가결정]</option>
                <option value="셀프신청">[셀프신청]</option>
                <option value="개인신청">[개인신청]</option>
                <option value="취업">[취업관련]</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                제목 <span className="text-blue-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="제목을 입력해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-400 mt-1">{formData.title.length}/100</p>
            </div>

            {/* Nickname */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-semibold text-gray-700 mb-2">
                닉네임 <span className="text-blue-500">*</span>
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="닉네임을 입력해주세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50"
                required
                maxLength={8}
              />
              <p className="text-xs text-gray-400 mt-1">한글 8자 또는 영어 8자까지 입력할 수 있습니다</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호 <span className="text-blue-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="수정/삭제용 비밀번호"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50"
                required
                minLength={4}
                maxLength={20}
              />
              <p className="text-xs text-gray-400 mt-1">* 글 수정/삭제 시 사용할 비밀번호 (4~20자)</p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                내용 <span className="text-blue-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="고민이나 질문을 자세히 작성해주세요..."
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50 text-sm"
                required
                maxLength={2000}
              />
              <p className="text-xs text-gray-400 mt-1">{formData.content.length}/2000</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">이미지 첨부</label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50">
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
                    <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs text-gray-500">클릭하여 이미지 업로드 (최대 5개, 5MB 이하)</span>
                  </div>
                </label>
                {/* 이미지 미리보기 */}
                {imagePreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`첨부 이미지 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 가이드라인 */}
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-xs text-gray-700">
              <div className="font-semibold text-blue-700 mb-2">글쓰기 가이드라인</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>구체적인 상황과 고민을 자세히 설명해주세요</li>
                <li>개인정보나 연락처는 포함하지 마세요</li>
                <li>타인을 비방하거나 욕설을 사용하지 마세요</li>
                <li>법률 자문은 전문가에게 문의하시기 바랍니다</li>
                <li>이미지는 최대 5개까지, 각 5MB 이하로 첨부 가능합니다</li>
              </ul>
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '작성 중...' : '글 작성하기'}
              </button>
            </div>
          </form>
        </div>

        {/* 개인정보 안내 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-xs text-gray-700">
          <div className="font-semibold text-yellow-800 mb-1">개인정보 보호 안내</div>
          <p>업로드된 이미지에는 개인정보가 포함되지 않도록 주의해주세요. 개인정보가 포함된 이미지는 즉시 삭제됩니다.</p>
        </div>
      </div>
    </div>
  );
} 