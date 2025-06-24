'use client';

import { useState } from 'react';
import { News } from '@/types';

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([
    {
      id: '1',
      title: '개인회생 신청자 역대 최대…코로나 이후 부채 급증',
      summary: '2024년 상반기 개인회생 신청 건수가 역대 최대치를 기록했다. 전문가들은 코로나19 이후 가계부채 증가와 금리 인상 영향이 크다고 분석한다.',
      source: '연합뉴스',
      date: '2024-06-20',
      category: '개인회생',
      url: 'https://www.yna.co.kr/view/AKR20240620000000'
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<News, 'id'>>({
    title: '',
    summary: '',
    source: '',
    date: '',
    category: '개인회생',
    url: ''
  });

  const handleAdd = () => {
    const newNews: News = {
      id: Date.now().toString(),
      ...formData
    };
    setNews([newNews, ...news]);
    setFormData({
      title: '',
      summary: '',
      source: '',
      date: '',
      category: '개인회생',
      url: ''
    });
    setIsAdding(false);
  };

  const handleEdit = (id: string) => {
    const newsItem = news.find(n => n.id === id);
    if (newsItem) {
      setFormData({
        title: newsItem.title,
        summary: newsItem.summary,
        source: newsItem.source,
        date: newsItem.date,
        category: newsItem.category,
        url: newsItem.url
      });
      setEditingId(id);
    }
  };

  const handleUpdate = () => {
    if (editingId) {
      setNews(news.map(n => 
        n.id === editingId 
          ? { ...n, ...formData }
          : n
      ));
      setFormData({
        title: '',
        summary: '',
        source: '',
        date: '',
        category: '개인회생',
        url: ''
      });
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setNews(news.filter(n => n.id !== id));
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      summary: '',
      source: '',
      date: '',
      category: '개인회생',
      url: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">뉴스 관리</h1>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            뉴스 추가
          </button>
        </div>

        {/* 추가/수정 폼 */}
        {(isAdding || editingId) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {isAdding ? '뉴스 추가' : '뉴스 수정'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="뉴스 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출처 *
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="언론사명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  날짜 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="개인회생">개인회생</option>
                  <option value="개인파산">개인파산</option>
                  <option value="법인회생">법인회생</option>
                  <option value="법인파산">법인파산</option>
                  <option value="워크아웃">워크아웃</option>
                  <option value="신용회복위원회">신용회복위원회</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  요약 *
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({...formData, summary: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="뉴스 요약을 입력하세요"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={isAdding ? handleAdd : handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isAdding ? '추가' : '수정'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 뉴스 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    출처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        item.category === '개인회생' ? 'bg-blue-100 text-blue-700' :
                        item.category === '개인파산' ? 'bg-red-100 text-red-700' :
                        item.category === '법인회생' ? 'bg-green-100 text-green-700' :
                        item.category === '법인파산' ? 'bg-orange-100 text-orange-700' :
                        item.category === '워크아웃' ? 'bg-purple-100 text-purple-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 