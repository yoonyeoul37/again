"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 광고주 데이터 타입
interface AdvertiserData {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

const PAGE_SIZE = 10;

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg animate-fade-in">
      {message}
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white text-xs">닫기</button>
    </div>
  );
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [advertisers, setAdvertisers] = useState<AdvertiserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");
  const [updatingAdvertiser, setUpdatingAdvertiser] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchAdvertisers();
  }, [user]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/');
    }
  }, [user, isLoading, router]);

  const fetchAdvertisers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('advertisers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('광고주 데이터 가져오기 실패:', error);
        alert('광고주 데이터를 불러오는데 실패했습니다.');
      } else {
        setAdvertisers(data || []);
      }
    } catch (error) {
      console.error('광고주 데이터 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 광고주 상태 업데이트
  const updateAdvertiserStatus = async (advertiserId: string, newStatus: string) => {
    setUpdatingAdvertiser(advertiserId);
    try {
      const { error } = await supabase
        .from('advertisers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', advertiserId);

      if (error) {
        console.error('광고주 상태 업데이트 실패:', error);
        alert('광고주 상태 업데이트에 실패했습니다.');
      } else {
        // 로컬 상태 업데이트
        setAdvertisers(prev => prev.map(advertiser => 
          advertiser.id === advertiserId ? { ...advertiser, status: newStatus as any, updated_at: new Date().toISOString() } : advertiser
        ));
        setToast('광고주 상태가 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('광고주 상태 업데이트 오류:', error);
      alert('광고주 상태 업데이트 중 오류가 발생했습니다.');
    } finally {
      setUpdatingAdvertiser(null);
    }
  };

  // 광고주 삭제
  const deleteAdvertiser = async (advertiserId: string) => {
    if (!window.confirm('정말 이 광고주를 삭제하시겠습니까? 관련된 모든 광고도 함께 삭제됩니다.')) return;

    try {
      const { error } = await supabase
        .from('advertisers')
        .delete()
        .eq('id', advertiserId);

      if (error) {
        console.error('광고주 삭제 실패:', error);
        alert('광고주 삭제에 실패했습니다.');
      } else {
        setAdvertisers(prev => prev.filter(advertiser => advertiser.id !== advertiserId));
        setToast('광고주가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('광고주 삭제 오류:', error);
      alert('광고주 삭제 중 오류가 발생했습니다.');
    }
  };

  // 페이징 계산
  const totalPages = Math.ceil(advertisers.length / PAGE_SIZE);
  const paginatedAdvertisers = advertisers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '승인됨';
      case 'rejected': return '거부됨';
      case 'pending': return '대기중';
      default: return '알 수 없음';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 임시로 로그인 체크 비활성화
  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <p className="text-gray-600">로그인이 필요합니다.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Toast message={toast} onClose={() => setToast("")} />
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">광고주 관리</h1>
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              대시보드로
            </Link>
            <Link href="/admin/ads" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              광고 관리
            </Link>
            <Link href="/admin/ads/banner" className="text-green-600 hover:text-green-700 text-sm font-medium">
              개인광고 관리
            </Link>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">총 {advertisers.length}명의 광고주</span>
          <button 
            onClick={fetchAdvertisers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            새로고침
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">광고주 데이터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-blue-50">
                <tr>
                  <th className="py-3 px-4 font-bold text-gray-700 text-left">번호</th>
                  <th className="py-3 px-4 font-bold text-gray-700 text-left">광고주명</th>
                  <th className="py-3 px-4 font-bold text-gray-700 text-left">연락처</th>
                  <th className="py-3 px-4 font-bold text-gray-700 text-left">이메일</th>
                  <th className="py-3 px-4 font-bold text-gray-700 text-left">상태</th>
                  <th className="py-3 px-4 font-bold text-gray-700 text-left">가입일</th>
                  <th className="py-3 px-4 font-bold text-gray-700 text-left">관리</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAdvertisers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-8">등록된 광고주가 없습니다.</td>
                  </tr>
                ) : (
                  paginatedAdvertisers.map((advertiser, idx) => (
                    <tr key={advertiser.id} className="border-b last:border-b-0 transition hover:bg-blue-50/60 group">
                      <td className="py-3 px-4 text-center">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{advertiser.name}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{advertiser.phone || '-'}</td>
                      <td className="py-3 px-4 text-gray-700">{advertiser.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(advertiser.status)}`}>
                          {getStatusText(advertiser.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{formatDate(advertiser.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {advertiser.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateAdvertiserStatus(advertiser.id, 'approved')}
                                disabled={updatingAdvertiser === advertiser.id}
                                className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded-full font-semibold transition disabled:opacity-50"
                              >
                                {updatingAdvertiser === advertiser.id ? '처리중...' : '승인'}
                              </button>
                              <button
                                onClick={() => updateAdvertiserStatus(advertiser.id, 'rejected')}
                                disabled={updatingAdvertiser === advertiser.id}
                                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded-full font-semibold transition disabled:opacity-50"
                              >
                                {updatingAdvertiser === advertiser.id ? '처리중...' : '거부'}
                              </button>
                            </>
                          )}
                          {advertiser.status === 'approved' && (
                            <button
                              onClick={() => updateAdvertiserStatus(advertiser.id, 'rejected')}
                              disabled={updatingAdvertiser === advertiser.id}
                              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded-full font-semibold transition disabled:opacity-50"
                            >
                              {updatingAdvertiser === advertiser.id ? '처리중...' : '거부'}
                            </button>
                          )}
                          {advertiser.status === 'rejected' && (
                            <button
                              onClick={() => updateAdvertiserStatus(advertiser.id, 'approved')}
                              disabled={updatingAdvertiser === advertiser.id}
                              className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded-full font-semibold transition disabled:opacity-50"
                            >
                              {updatingAdvertiser === advertiser.id ? '처리중...' : '승인'}
                            </button>
                          )}
                          <button 
                            className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-full font-semibold transition" 
                            onClick={() => deleteAdvertiser(advertiser.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이징 */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`px-3 py-1 rounded-full text-sm font-semibold border transition ${page === num ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
              >
                {num}
              </button>
            ))}
          </div>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">총 광고주</p>
                <p className="text-2xl font-bold text-blue-900">{advertisers.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">승인 대기</p>
                <p className="text-2xl font-bold text-yellow-900">{advertisers.filter(a => a.status === 'pending').length}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">승인됨</p>
                <p className="text-2xl font-bold text-green-900">{advertisers.filter(a => a.status === 'approved').length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 