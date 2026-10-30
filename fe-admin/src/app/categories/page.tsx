'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faPlus,
  faMagnifyingGlass,
  faFilter,
  faPenToSquare,
  faTrashCan,
  faXmark,
  faCheck,
  faSpinner,
  faFolder,
  faFolderTree,
  faCircleCheck,
  faTriangleExclamation,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { hasPermission } from '@/utils/permissions';
import apiClient from '@/lib/axios';

interface CategoryChild {
  id: number;
  parentId?: number | null;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  parentId?: number | null;
  name: string;
  slug: string;
  children?: CategoryChild[];
}

export default function CategoriesPage() {
  const { admin } = useAdminAuth();
  const canManage = hasPermission(admin, 'PRODUCTS_MANAGE');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: '',
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/categories');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setCategories(res.data.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh mục:', err);
      showToast('error', 'Chưa thể tải danh mục từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
      slug: editingCategory ? prev.slug : generatedSlug,
    }));
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parentId: '',
    });
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId ? String(cat.parentId) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Vui lòng nhập tên danh mục.');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('error', 'Vui lòng nhập slug định danh.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        parentId: formData.parentId ? Number(formData.parentId) : null,
      };

      if (editingCategory) {
        // Cập nhật
        const res = await apiClient.put(`/categories/${editingCategory.id}`, payload);
        if (res.data?.success) {
          showToast('success', `Đã cập nhật danh mục: ${payload.name}`);
        }
      } else {
        // Thêm mới
        const res = await apiClient.post('/categories', payload);
        if (res.data?.success) {
          showToast('success', `Đã tạo danh mục mới: ${payload.name}`);
        }
      }

      setShowModal(false);
      await fetchCategories();
    } catch (err: any) {
      console.error('Lỗi lưu danh mục:', err);
      const msg = err.response?.data?.message || err.message || 'Thao tác không thành công';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục '${cat.name}'?`)) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiClient.delete(`/categories/${cat.id}`);
      if (res.data?.success) {
        showToast('success', `Đã xóa danh mục '${cat.name}' thành công.`);
        await fetchCategories();
      }
    } catch (err: any) {
      console.error('Lỗi xóa danh mục:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Không thể xóa danh mục này do có ràng buộc dữ liệu.';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const s = search.toLowerCase();
    const matchParent = c.name.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s);
    const matchChildren = c.children?.some(
      (ch) => ch.name.toLowerCase().includes(s) || ch.slug.toLowerCase().includes(s)
    );
    return matchParent || matchChildren;
  });

  return (
    <AdminShell
      title="Quản Lý Danh Mục Sản Phẩm"
      subtitle="Phân loại cây danh mục đồng hồ nam, nữ, cổ điển, thể thao và BRU_WATCH"
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
                placeholder="Tìm theo tên danh mục, slug..."
                className="w-full pl-9 pr-3 py-2 bg-[#070e0a] rounded-lg border border-white/[0.08] text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>

            <button
              onClick={fetchCategories}
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
              Thêm Danh Mục Mới
            </button>
          )}
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faFolder} className="text-[#d4af37] text-xs" />
              Danh Mục Cấp Gốc
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{categories.length}</p>
          </div>
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faFolderTree} className="text-emerald-400 text-xs" />
              Phân Nhánh Danh Mục Con
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">
              {categories.reduce((acc, c) => acc + (c.children?.length || 0), 0)}
            </p>
          </div>
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLayerGroup} className="text-sky-400 text-xs" />
              Tổng Số Phân Loại
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">
              {categories.length +
                categories.reduce((acc, c) => acc + (c.children?.length || 0), 0)}
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="luxury-card rounded-xl p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin text-2xl text-[#d4af37]" />
            <p className="text-xs tracking-wider">Đang nạp cây danh mục từ MySQL...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredCategories.length === 0 && (
          <div className="luxury-card rounded-xl p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3 border border-dashed border-white/[0.1]">
            <FontAwesomeIcon icon={faLayerGroup} className="text-3xl text-stone-500" />
            <p className="text-sm text-stone-300 font-medium">Chưa có danh mục nào</p>
            <p className="text-xs text-stone-500">
              Bấm &quot;Thêm Danh Mục Mới&quot; để tạo cấu trúc phân loại sản phẩm.
            </p>
          </div>
        )}

        {/* Categories Tree Table */}
        {!loading && filteredCategories.length > 0 && (
          <div className="luxury-card rounded-xl overflow-hidden border border-white/[0.08] bg-[#08100c]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-[#040806] text-stone-400 font-medium">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Tên Danh Mục</th>
                    <th className="py-3 px-4">Slug Định Danh</th>
                    <th className="py-3 px-4 text-center">Phân Cấp / Nhánh Con</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-stone-200">
                  {filteredCategories.map((cat) => {
                    const childCount = cat.children?.length || 0;

                    return (
                      <React.Fragment key={cat.id}>
                        <tr className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-3.5 px-4 font-mono text-stone-400">#{cat.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-white group-hover:text-[#d4af37] transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-[#040806] border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37] text-xs">
                                <FontAwesomeIcon icon={faFolder} />
                              </span>
                              <span>{cat.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-stone-400">/{cat.slug}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-white/[0.04] border border-white/[0.06] text-stone-300 font-mono">
                              {childCount > 0 ? `${childCount} danh mục con` : 'Danh mục gốc'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {canManage ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditModal(cat)}
                                  title="Chỉnh sửa danh mục"
                                  className="p-1.5 rounded hover:bg-white/[0.06] text-stone-400 hover:text-[#d4af37] transition-colors"
                                >
                                  <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
                                </button>
                                <button
                                  onClick={() => handleDelete(cat)}
                                  title="Xóa danh mục"
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

                        {/* Danh mục con (nếu có) */}
                        {cat.children?.map((child) => (
                          <tr
                            key={`child-${child.id}`}
                            className="bg-black/20 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-2.5 px-4 font-mono text-stone-500 text-[11px]">
                              ↳ #{child.id}
                            </td>
                            <td className="py-2.5 px-4 text-stone-300 pl-10 text-[11px]">
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon
                                  icon={faChevronRight}
                                  className="text-[9px] text-[#d4af37]/60"
                                />
                                <span>{child.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-stone-500 text-[11px]">
                              /{child.slug}
                            </td>
                            <td className="py-2.5 px-4 text-center text-[10px] text-stone-500">
                              Thuộc: {cat.name}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              {canManage && (
                                <button
                                  onClick={() =>
                                    handleDelete({
                                      id: child.id,
                                      name: child.name,
                                      slug: child.slug,
                                    })
                                  }
                                  title="Xóa danh mục con"
                                  className="p-1 rounded hover:bg-red-500/10 text-stone-400 hover:text-red-400 transition-colors"
                                >
                                  <FontAwesomeIcon icon={faTrashCan} className="text-[11px]" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Thêm / Sửa Danh Mục */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-md border border-[#d4af37]/30 bg-[#070e0a] shadow-2xl p-6 text-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Lưu trữ trực tiếp vào bảng CSDL MySQL `categories`
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
                {/* Tên danh mục */}
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Tên Danh Mục <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="VD: Đồng hồ bấm giờ Chronograph, Tourbillon..."
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
                    placeholder="VD: dong-ho-chronograph"
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37] font-mono"
                  />
                </div>

                {/* Danh mục cha (nếu có) */}
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Danh Mục Cấp Cha (Tùy chọn)
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, parentId: e.target.value }))}
                    aria-label="Chọn danh mục cha"
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37] cursor-pointer"
                  >
                    <option value="">-- Là danh mục gốc (Không có cha) --</option>
                    {categories
                      .filter((c) => !editingCategory || c.id !== editingCategory.id)
                      .map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                  </select>
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
                        {editingCategory ? 'Cập Nhật Danh Mục' : 'Lưu Danh Mục'}
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

