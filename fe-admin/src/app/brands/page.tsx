'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTag,
  faPlus,
  faMagnifyingGlass,
  faFilter,
  faPenToSquare,
  faTrashCan,
  faXmark,
  faCheck,
  faSpinner,
  faGlobe,
  faClock,
  faCircleCheck,
  faTriangleExclamation,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { hasPermission } from '@/utils/permissions';
import apiClient from '@/lib/axios';

interface Brand {
  id: number;
  name: string;
  slug: string;
  country?: string | null;
  products?: { id: number; name: string }[];
}

export default function BrandsPage() {
  const { admin } = useAdminAuth();
  const canManage = hasPermission(admin, 'PRODUCTS_MANAGE');

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    country: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/brands');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setBrands(res.data.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách thương hiệu:', err);
      showToast('error', 'Chưa thể tải danh sách thương hiệu từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
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
      slug: editingBrand ? prev.slug : generatedSlug,
    }));
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      country: '',
    });
    setShowModal(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      country: brand.country || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Vui lòng nhập tên thương hiệu.');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('error', 'Vui lòng nhập mã slug định danh.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        country: formData.country.trim() || null,
      };

      if (editingBrand) {
        // Cập nhật
        const res = await apiClient.put(`/brands/${editingBrand.id}`, payload);
        if (res.data?.success) {
          showToast('success', `Đã cập nhật thương hiệu: ${payload.name}`);
        }
      } else {
        // Thêm mới
        const res = await apiClient.post('/brands', payload);
        if (res.data?.success) {
          showToast('success', `Đã tạo mới thương hiệu: ${payload.name}`);
        }
      }

      setShowModal(false);
      await fetchBrands();
    } catch (err: any) {
      console.error('Lỗi lưu thương hiệu:', err);
      const msg = err.response?.data?.message || err.message || 'Thao tác không thành công';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu '${brand.name}'?`)) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiClient.delete(`/brands/${brand.id}`);
      if (res.data?.success) {
        showToast('success', `Đã xóa thương hiệu '${brand.name}' thành công.`);
        await fetchBrands();
      }
    } catch (err: any) {
      console.error('Lỗi xóa thương hiệu:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể xóa thương hiệu này vì có thể đã liên kết với sản phẩm.';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBrands = brands.filter((b) => {
    const s = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(s) ||
      b.slug.toLowerCase().includes(s) ||
      (b.country && b.country.toLowerCase().includes(s))
    );
  });

  return (
    <AdminShell
      title="Quản Lý Thương Hiệu & Hãng Đồng Hồ"
      subtitle="Thiết lập danh bạ nhà sản xuất, xưởng chế tác BRU_WATCH và xuất xứ quốc gia"
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
                placeholder="Tìm theo tên hãng, mã slug, xuất xứ..."
                className="w-full pl-9 pr-3 py-2 bg-[#070e0a] rounded-lg border border-white/[0.08] text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>

            <button
              onClick={fetchBrands}
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
              Thêm Thương Hiệu Mới
            </button>
          )}
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBuilding} className="text-[#d4af37] text-xs" />
              Tổng Hãng Sản Xuất
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{brands.length}</p>
          </div>
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faGlobe} className="text-sky-400 text-xs" />
              Thương Hiệu Thụy Sĩ
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">
              {brands.filter((b) => b.country?.toLowerCase().includes('thụy')).length}
            </p>
          </div>
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="text-emerald-400 text-xs" />
              Mẫu Đồng Hồ Đang Gắn Hãng
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">
              {brands.reduce((acc, b) => acc + (b.products?.length || 0), 0)}
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="luxury-card rounded-xl p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin text-2xl text-[#d4af37]" />
            <p className="text-xs tracking-wider">Đang đồng bộ danh mục thương hiệu từ MySQL...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredBrands.length === 0 && (
          <div className="luxury-card rounded-xl p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3 border border-dashed border-white/[0.1]">
            <FontAwesomeIcon icon={faTag} className="text-3xl text-stone-500" />
            <p className="text-sm text-stone-300 font-medium">Không tìm thấy thương hiệu nào</p>
            <p className="text-xs text-stone-500">
              Bấm &quot;Thêm Thương Hiệu Mới&quot; để bổ sung nhà sản xuất đồng hồ vào hệ thống.
            </p>
          </div>
        )}

        {/* Brands Table & Grid */}
        {!loading && filteredBrands.length > 0 && (
          <div className="luxury-card rounded-xl overflow-hidden border border-white/[0.08] bg-[#08100c]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-[#040806] text-stone-400 font-medium">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Tên Thương Hiệu</th>
                    <th className="py-3 px-4">Slug Định Danh</th>
                    <th className="py-3 px-4">Xuất Xứ / Quốc Gia</th>
                    <th className="py-3 px-4 text-center">Mẫu Liên Kết</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-stone-200">
                  {filteredBrands.map((brand) => (
                    <tr
                      key={brand.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono text-stone-400">#{brand.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-white group-hover:text-[#d4af37] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#040806] border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37] text-xs">
                            <FontAwesomeIcon icon={faTag} />
                          </span>
                          <span>{brand.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-stone-400">/{brand.slug}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] bg-white/[0.04] border border-white/[0.08] text-stone-300 inline-flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faGlobe} className="text-[#d4af37] text-[10px]" />
                          {brand.country || 'Quốc tế'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-stone-300 font-medium">
                          {brand.products?.length || 0} mẫu
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canManage ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(brand)}
                              title="Chỉnh sửa thương hiệu"
                              className="p-1.5 rounded hover:bg-white/[0.06] text-stone-400 hover:text-[#d4af37] transition-colors"
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleDelete(brand)}
                              title="Xóa thương hiệu"
                              className="p-1.5 rounded hover:bg-red-500/10 text-stone-400 hover:text-red-400 transition-colors"
                            >
                              <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-stone-500">Chỉ xem</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Thêm / Sửa Thương Hiệu */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-md border border-[#d4af37]/30 bg-[#070e0a] shadow-2xl p-6 text-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                    <FontAwesomeIcon icon={faTag} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editingBrand ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Lưu trữ trực tiếp vào bảng CSDL MySQL `brands`
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Tên hãng */}
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Tên Thương Hiệu <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="VD: Patek Philippe, Rolex, Omega..."
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Slug Định Danh URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="VD: patek-philippe"
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37] font-mono"
                  />
                </div>

                {/* Quốc gia */}
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Quốc Gia / Xuất Xứ Xưởng Chế Tác
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                    placeholder="Nhập hoặc chọn xuất xứ (VD: Nhật Bản, Thụy Sĩ, Đức, Pháp...)"
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-stone-500 mr-1">Gợi ý nhanh:</span>
                    {['Thụy Sĩ', 'Nhật Bản', 'Đức', 'Pháp', 'Ý', 'Mỹ'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, country: c }))}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                          formData.country === c
                            ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40 font-medium'
                            : 'bg-white/[0.04] text-stone-400 border-white/[0.08] hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
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
                    className="px-5 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                        Đang Lưu...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                        {editingBrand ? 'Cập Nhật Hãng' : 'Lưu Thương Hiệu'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

