"use client";
import { useState } from "react";
import { sampleAds } from "@/data/sampleData";
import { Ad } from "@/types";

const PAGE_SIZE = 5;

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg animate-fade-in">
      {message}
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white text-xs">닫기</button>
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className={`w-11 h-6 flex items-center rounded-full transition-colors duration-200 ${checked ? 'bg-blue-500' : 'bg-gray-300'}`}
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function AdminPage() {
  const [ads, setAds] = useState<Ad[]>(sampleAds);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalAd, setModalAd] = useState<Ad | null>(null);

  // 페이징 계산
  const totalPages = Math.ceil(ads.length / PAGE_SIZE);
  const paginatedAds = ads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 광고 삭제
  const handleDelete = (id: string) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setAds(prev => prev.filter(ad => ad.id !== id));
      setToast("광고가 삭제되었습니다.");
    }
  };

  // 광고 노출여부 토글
  const handleToggleActive = (id: string) => {
    setAds(prev => prev.map(ad => ad.id === id ? { ...ad, isActive: !ad.isActive, updatedAt: new Date().toISOString() } : ad));
    setToast("광고 노출 상태가 변경되었습니다.");
  };

  // 광고 추가/수정 모달 열기
  const openModal = (ad?: Ad) => {
    setModalAd(ad ?? null);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  // 광고 추가/수정 (간단 폼)
  const handleModalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const id = modalAd?.id || `ad${Date.now()}`;
    const newAd: Ad = {
      id,
      position: formData.get("position") as any,
      code: formData.get("code") as string,
      isActive: formData.get("isActive") === "on",
      createdAt: modalAd?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAds(prev => {
      const exists = prev.find(a => a.id === id);
      if (exists) {
        return prev.map(a => a.id === id ? newAd : a);
      } else {
        return [newAd, ...prev];
      }
    });
    setShowModal(false);
    setToast(modalAd ? "광고가 수정되었습니다." : "광고가 추가되었습니다.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <Toast message={toast} onClose={() => setToast("")} />
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">광고 관리</h1>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">총 {ads.length}개 광고</span>
          <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">+ 광고 추가</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-50">
              <tr>
                <th className="py-2 px-3 font-bold text-gray-700">번호</th>
                <th className="py-2 px-3 font-bold text-gray-700">위치</th>
                <th className="py-2 px-3 font-bold text-gray-700">상태</th>
                <th className="py-2 px-3 font-bold text-gray-700">미리보기</th>
                <th className="py-2 px-3 font-bold text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAds.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-8">광고가 없습니다.</td>
                </tr>
              ) : (
                paginatedAds.map((ad, idx) => (
                  <tr key={ad.id} className="border-b last:border-b-0 transition hover:bg-blue-50/60 group">
                    <td className="py-2 px-3 text-center">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition ${ad.position === 'content' ? 'bg-blue-100 text-blue-700' : ad.position === 'sidebar' ? 'bg-yellow-100 text-yellow-700' : 'bg-pink-100 text-pink-700'}`}>
                        {ad.position === 'content' && <span>📰</span>}
                        {ad.position === 'sidebar' && <span>📌</span>}
                        {ad.position === 'bottom' && <span>⬇️</span>}
                        {ad.position}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Switch checked={ad.isActive} onChange={() => handleToggleActive(ad.id)} />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="inline-block transition group-hover:scale-105 group-hover:ring-2 group-hover:ring-blue-200 rounded-md" dangerouslySetInnerHTML={{ __html: ad.code }} />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button onClick={() => openModal(ad)} className="text-xs text-blue-600 hover:underline px-2 py-1 rounded-full font-semibold transition">수정</button>
                      <button className="text-xs text-red-500 hover:underline px-2 py-1 rounded-full font-semibold transition" onClick={() => handleDelete(ad.id)}>삭제</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* 페이징 */}
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
      </div>
      {/* 광고 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md animate-fade-in-up relative">
            <button onClick={closeModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">×</button>
            <h2 className="text-lg font-bold mb-4">{modalAd ? '광고 수정' : '광고 추가'}</h2>
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">위치</label>
                <select name="position" defaultValue={modalAd?.position || 'content'} className="w-full border rounded px-3 py-2">
                  <option value="content">content</option>
                  <option value="sidebar">sidebar</option>
                  <option value="bottom">bottom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">광고 코드(HTML)</label>
                <textarea name="code" defaultValue={modalAd?.code || ''} className="w-full border rounded px-3 py-2" rows={3} required />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isActive" id="isActive" defaultChecked={modalAd?.isActive ?? true} />
                <label htmlFor="isActive" className="text-sm">노출</label>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">취소</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 