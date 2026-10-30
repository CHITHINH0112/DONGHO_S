'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSliders,
  faPlus,
  faMagnifyingGlass,
  faFilter,
  faPenToSquare,
  faTrashCan,
  faXmark,
  faCheck,
  faSpinner,
  faClock,
  faCircleCheck,
  faTriangleExclamation,
  faWandMagicSparkles,
  faMicrochip,
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { hasPermission } from '@/utils/permissions';
import apiClient from '@/lib/axios';

interface Feature {
  id: number;
  name: string;
  slug: string;
  products?: { id: number; name: string }[];
}

export default function FeaturesPage() {
  const { admin } = useAdminAuth();
  const canManage = hasPermission(admin, 'PRODUCTS_MANAGE');

  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  // Delete Confirm State
  const [deletingFeature, setDeletingFeature] = useState<Feature | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/features');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setFeatures(res.data.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách tính năng:', err);
      showToast('error', 'Chưa thể tải danh sách tính năng từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingFeature ? prev.slug : generatedSlug,
    }));
  };

  const openCreateModal = () => {
    setEditingFeature(null);
    setFormData({
      name: '',
      slug: '',
    });
    setShowModal(true);
  };

  const openEditModal = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      name: feature.name,
      slug: feature.slug,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Vui lòng nhập tên tính năng kỹ thuật.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingFeature) {
        // Cập nhật
        const res = await apiClient.put(`/features/${editingFeature.id}`, formData);
        if (res.data?.success) {
          showToast('success', `Đã cập nhật tính năng '${formData.name}' thành công.`);
          setShowModal(false);
          fetchFeatures();
        }
      } else {
        // Thêm mới
        const res = await apiClient.post('/features', formData);
        if (res.data?.success) {
          showToast('success', `Đã thêm mới tính năng '${formData.name}' thành công.`);
          setShowModal(false);
          fetchFeatures();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu tính năng.';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFeature) return;

    try {
      setSubmitting(true);
      const res = await apiClient.delete(`/features/${deletingFeature.id}`);
      if (res.data?.success) {
        showToast('success', `Đã xóa tính năng '${deletingFeature.name}'.`);
        setDeletingFeature(null);
        fetchFeatures();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi xóa tính năng.';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFeatures = features.filter((f) => {
    const s = search.toLowerCase();
    return f.name.toLowerCase().includes(s) || f.slug.toLowerCase().includes(s);
  });

  return (
    <AdminShell
      title="Quản Lý Tính Năng Kỹ Thuật"
      subtitle="Thiết lập danh mục tính năng đồng hồ: Chronograph, Lịch vạn niên, Moonphase, Kháng từ, GMT..."
    >
      <div className="space-y-6">
        {/* Toast thông báo */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-[#00844e]/90 text-white border-emerald-400/40'
                : 'bg-red-950/90 text-white border-red-500/40'
            }`}
          >
            <FontAwesomeIcon
              icon={toast.type === 'success' ? faCircleCheck : faTriangleExclamation}
              className="text-lg"
            />
            <span className="text-xs font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-stone-300 hover:text-white">
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="luxury-card rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#d4af37]/15 bg-[#0a120e]">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên tính năng hoặc mã slug..."
                className="w-full pl-9 pr-3 py-2 bg-[#070e0a] rounded-lg border border-white/[0.08] text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>

            <button
              onClick={fetchFeatures}
              title="Làm mới dữ liệu"
              className="px-3 py-2 rounded-lg bg-white/[0.05] text-stone-300 hover:text-white border border-white/[0.08] text-xs flex items-center gap-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
              Làm Mới
            </button>
          </div>

          {canManage && (
            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/25 transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              Thêm Tính Năng Mới
            </button>
          )}
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faSliders} className="text-[#d4af37] text-xs" />
              Tổng Số Tính Năng
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{features.length}</p>
          </div>
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="text-emerald-400 text-xs" />
              Mẫu Đồng Hồ Đang Áp Dụng
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">
              {features.reduce((acc, f) => acc + (f.products?.length || 0), 0)}
            </p>
          </div>
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c] col-span-2 sm:col-span-1">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faMicrochip} className="text-sky-400 text-xs" />
              Độ Bao Phủ Công Nghệ
            </span>
            <p className="text-xl font-bold text-sky-400 mt-1 font-mono">100% Master</p>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="luxury-card rounded-xl p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin text-2xl text-[#d4af37]" />
            <p className="text-xs tracking-wider">Đang đồng bộ danh mục tính năng kỹ thuật...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredFeatures.length === 0 && (
          <div className="luxury-card rounded-xl p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3 border border-dashed border-white/[0.1]">
            <FontAwesomeIcon icon={faSliders} className="text-3xl text-stone-500" />
            <p className="text-sm text-stone-300 font-medium">Không tìm thấy tính năng nào</p>
            <p className="text-xs text-stone-500">
              Bạn có thể nhấn &quot;Thêm Tính Năng Mới&quot; để tạo tính năng đầu tiên.
            </p>
          </div>
        )}

        {/* Danh sách Features (Grid thẻ phong cách Luxury) */}
        {!loading && filteredFeatures.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeatures.map((feat) => {
              const productCount = feat.products?.length || 0;
              return (
                <div
                  key={feat.id}
                  className="luxury-card rounded-xl p-4 border border-white/[0.08] hover:border-[#d4af37]/35 bg-[#08100c] transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37] group-hover:scale-105 transition-transform">
                          <FontAwesomeIcon icon={faWandMagicSparkles} className="text-sm" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white group-hover:text-[#d4af37] transition-colors leading-snug">
                            {feat.name}
                          </h4>
                          <span className="font-mono text-[10px] text-stone-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06] mt-1 inline-block">
                            slug: {feat.slug}
                          </span>
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => openEditModal(feat)}
                            title="Sửa tính năng"
                            className="w-7 h-7 rounded bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white flex items-center justify-center text-xs transition-colors"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>
                          <button
                            onClick={() => setDeletingFeature(feat)}
                            title="Xóa tính năng"
                            className="w-7 h-7 rounded bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-red-500/20 flex items-center justify-center text-xs transition-colors"
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faClock} className="text-stone-500 text-[10px]" />
                      Đang gắn vào:
                    </span>
                    <span className="font-mono font-medium text-emerald-400">
                      {productCount} mẫu đồng hồ
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Thêm Mới / Chỉnh Sửa Feature */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card w-full max-w-md rounded-2xl border border-[#d4af37]/30 bg-[#0c1611] p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] text-xs">
                    <FontAwesomeIcon icon={editingFeature ? faPenToSquare : faPlus} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {editingFeature ? 'Cập Nhật Tính Năng' : 'Thêm Tính Năng Kỹ Thuật'}
                    </h3>
                    <p className="text-[10px] text-stone-400">
                      Định danh tính năng độc bản trên mẫu chế tác
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Tên Tính Năng <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="VD: Bấm giờ Chronograph, Múi giờ kép GMT..."
                    className="w-full px-3.5 py-2.5 bg-[#070e0a] rounded-lg border border-white/[0.1] text-xs text-white placeholder-stone-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Đường dẫn rút gọn (Slug) <span className="text-stone-500 font-normal">(Tự động tạo)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="VD: chronograph, gmt, moonphase..."
                    className="w-full px-3.5 py-2.5 bg-[#070e0a] rounded-lg border border-white/[0.1] text-xs font-mono text-emerald-400 placeholder-stone-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/25 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                        <span>Đang Lưu...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                        <span>{editingFeature ? 'Cập Nhật' : 'Tạo Mới'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Xác Nhận Xóa Feature */}
        {deletingFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card w-full max-w-sm rounded-2xl border border-red-500/30 bg-[#120808] p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Xóa Tính Năng Này?</h3>
                  <p className="text-[11px] text-stone-400">Thao tác này không thể hoàn tác.</p>
                </div>
              </div>

              <p className="text-xs text-stone-300 bg-black/40 p-3 rounded-lg border border-white/[0.06] leading-relaxed">
                Bạn có chắc chắn muốn xóa tính năng{' '}
                <strong className="text-white font-semibold">
                  &quot;{deletingFeature.name}&quot;
                </strong>
                ? Các mẫu đồng hồ đang liên kết sẽ bị gỡ bỏ tính năng này.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingFeature(null)}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                      <span>Đang Xóa...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                      <span>Xác Nhận Xóa</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

