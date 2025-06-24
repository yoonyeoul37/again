'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ConsultationPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: '',
    content: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 여기에 폼 제출 로직 추가 (예: API 호출, 이메일 발송 등)
    alert('상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10" style={{fontFamily: `'Malgun Gothic', '맑은 고딕', Dotum, '돋움', Arial, Helvetica, sans-serif`}}>
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-800 mb-4 flex items-center gap-2 justify-center">
            <span className="text-2xl">📞</span> 무료 상담 신청
          </h1>
          <p className="text-gray-600 text-lg">전문 법무사/변호사가 직접 상담해드립니다</p>
        </div>

        {/* 상담 폼 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="실명을 입력해주세요"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="010-0000-0000"
              />
            </div>

            {/* 상담 희망 분야 */}
            <div>
              <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">
                상담 희망 분야 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">선택해주세요</option>
                <option value="개인회생">개인회생</option>
                <option value="개인파산">개인파산</option>
                <option value="법인회생">법인회생</option>
                <option value="법인파산">법인파산</option>
                <option value="워크아웃">워크아웃</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 상담 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-bold text-gray-700 mb-2">
                상담 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="상담하고 싶은 내용을 자세히 적어주세요. (부채 현황, 소득 상황, 가족 구성원 등)"
              />
            </div>

            {/* 제출 버튼 */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-200 shadow-lg"
              >
                상담 신청하기
              </button>
            </div>
          </form>

          {/* 안내사항 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">📋 안내사항</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 상담 신청 후 24시간 내에 전문가가 연락드립니다</li>
              <li>• 개인정보는 상담 목적으로만 사용되며 안전하게 보호됩니다</li>
              <li>• 상담은 무료이며, 추가 비용이 발생하지 않습니다</li>
            </ul>
          </div>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="mt-6 text-center">
          <Link href="/qa" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← Q/A 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 