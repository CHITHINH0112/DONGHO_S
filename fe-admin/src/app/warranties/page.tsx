'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faWrench,
  faCircleCheck,
  faCircleXmark,
  faClock,
  faPlus,
  faRotateRight,
  faMagnifyingGlass,
  faPenToSquare,
  faXmark,
  faSpinner,
  faCheck,
  faCalendarDays,
  faTag,
  faCoins,
  faUser,
  faHashtag,
  faFileLines,
  faPhone,
  faSliders,
  faMoneyBillWave,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import apiClient from '@/lib/axios';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { hasPermission } from '@/utils/permissions';

// --- INTERFACES ---
interface WarrantyClaim {
  id: number;
  serialNumberId: number;
  serialNumber?: {
    id: number;
    serial_number?: string;
    serialNumber?: string;
  };
  serviceId?: number | null;
  service?: {
    id: number;
    name: string;
    serviceType: string;
    basePrice: number | string;
    isWarrantyEligible?: boolean;
  } | null;
  customerId?: number | null;
  customer?: {
    id: number;
    name: string;
    phone?: string;
  } | null;
  staffId?: number | null;
  staff?: {
    id: number;
    name: string;
    staffCode: string;
  } | null;
  issueDescription: string;
  status: 'received' | 'processing' | 'resolved' | 'returned' | 'cancelled' | string;
  note?: string | null;
  thoiDiemBaoHanh?: string;
  ngayDuKienTraMay?: string | null;
  returnedDate?: string | null;
  createdAt?: string;
}

interface RepairTicket {
  id: number;
  serviceId: number;
  service?: {
    id: number;
    name: string;
    basePrice: number | string;
    estimatedDays: number;
    isWarrantyEligible?: boolean;
  };
  serialNumberId?: number | null;
  serialNumber?: {
    id: number;
    serial_number?: string;
    serialNumber?: string;
  } | null;
  customerId?: number | null;
  customer?: {
    id: number;
    name: string;
    phone?: string;
  } | null;
  staffId?: number | null;
  staff?: {
    id: number;
    name: string;
    staffCode: string;
  } | null;
  issueDescription: string;
  cost?: number | string | null;
  paymentStatus?: 'unpaid' | 'paid' | string;
  status: 'received' | 'inspecting' | 'in_progress' | 'completed' | 'delivered' | 'cancelled' | string;
  receivedDate?: string;
  appointmentDate?: string | null;
  note?: string | null;
  createdAt?: string;
}

interface WatchServiceItem {
  id: number;
  name: string;
  serviceType: 'service' | 'polish' | 'waterproof' | 'repair' | 'battery' | 'strap' | 'resize' | string;
  basePrice: number | string;
  estimatedDays: number;
  isActive: boolean;
  isWarrantyEligible: boolean;
}

export default function WarrantiesPage() {
  const { admin } = useAdminAuth();
  const canManage = hasPermission(admin, 'WARRANTIES_MANAGE');

  const [activeTab, setActiveTab] = useState<'claims' | 'repairs' | 'services'>('claims');
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dữ liệu từ API
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [repairs, setRepairs] = useState<RepairTicket[]>([]);
  const [services, setServices] = useState<WatchServiceItem[]>([]);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // --- MODALS STATE ---
  // 1. Tạo Phiếu Tiếp Nhận Bảo Hành
  const [showCreateClaimModal, setShowCreateClaimModal] = useState<boolean>(false);
  const [submittingClaim, setSubmittingClaim] = useState<boolean>(false);
  const [claimForm, setClaimForm] = useState({
    serialNumberId: '',
    serviceId: '',
    customerName: '',
    customerPhone: '',
    issueDescription: '',
    note: '',
  });

  // 2. Cập nhật trạng thái phiếu bảo hành
  const [updatingClaim, setUpdatingClaim] = useState<WarrantyClaim | null>(null);
  const [claimStatusForm, setClaimStatusForm] = useState({
    status: 'processing',
    note: '',
  });

  // 3. Lập Phiếu Sửa Chữa Mới
  const [showCreateRepairModal, setShowCreateRepairModal] = useState<boolean>(false);
  const [submittingRepair, setSubmittingRepair] = useState<boolean>(false);
  const [repairForm, setRepairForm] = useState({
    serviceId: '',
    serialNumberId: '',
    customerName: '',
    customerPhone: '',
    issueDescription: '',
    cost: '',
    paymentStatus: 'unpaid',
  });

  // 4. Cập nhật trạng thái phiếu sửa chữa
  const [updatingRepair, setUpdatingRepair] = useState<RepairTicket | null>(null);
  const [repairStatusForm, setRepairStatusForm] = useState({
    status: 'in_progress',
    cost: '',
    paymentStatus: 'unpaid',
    note: '',
  });

  // 5. Thêm / Sửa Gói Dịch Vụ Sửa Chữa (Watch Services)
  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<WatchServiceItem | null>(null);
  const [submittingService, setSubmittingService] = useState<boolean>(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    serviceType: 'service',
    basePrice: '500000',
    estimatedDays: 3,
    isActive: true,
    isWarrantyEligible: false,
  });

  // --- FETCH DỮ LIỆU ---
  const fetchData = async () => {
    try {
      setLoading(true);
      const [claimsRes, repairsRes, servicesRes] = await Promise.allSettled([
        apiClient.get('/warranties/claims'),
        apiClient.get('/services/repairs/tickets'),
        apiClient.get('/services?all=true'),
      ]);

      if (claimsRes.status === 'fulfilled' && claimsRes.value.data?.success) {
        setClaims(claimsRes.value.data.data || []);
      }
      if (repairsRes.status === 'fulfilled' && repairsRes.value.data?.success) {
        setRepairs(repairsRes.value.data.data || []);
      }
      if (servicesRes.status === 'fulfilled' && servicesRes.value.data?.success) {
        setServices(servicesRes.value.data.data || []);
      }
    } catch {
      showToast('error', 'Chưa thể tải toàn bộ dữ liệu bảo hành & dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FORMATTERS ---
  const formatVND = (amount: number | string | null | undefined) => {
    const num = Number(amount || 0);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Trạng thái phiếu tiếp nhận bảo hành (chuẩn enum: received, processing, resolved, returned, cancelled)
  const getClaimStatusBadge = (status: string) => {
    switch (status) {
      case 'returned':
        return { label: 'Đã Bàn Giao Khách', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'resolved':
        return { label: 'Đã Khắc Phục Xong', cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
      case 'processing':
        return { label: 'Đang Xử Lý & Đo Kiểm', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'received':
        return { label: 'Đã Tiếp Nhận Máy', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'cancelled':
        return { label: 'Từ Chối / Đã Hủy', cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      default:
        return { label: 'Đã Tiếp Nhận', cls: 'bg-stone-500/15 text-stone-400 border-stone-500/30' };
    }
  };

  // Trạng thái phiếu sửa chữa (chuẩn enum: received, inspecting, in_progress, completed, delivered, cancelled)
  const getRepairStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return { label: 'Đã Giao Trả Khách', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'completed':
        return { label: 'Đã Hoàn Thành Sửa', cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
      case 'in_progress':
        return { label: 'Đang Gia Công & Sửa', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'inspecting':
        return { label: 'Đang Đo Kiểm Định Máy', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'received':
        return { label: 'Đã Tiếp Nhận Máy', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'cancelled':
        return { label: 'Đã Hủy Phiếu', cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      default:
        return { label: 'Đã Tiếp Nhận', cls: 'bg-stone-500/15 text-stone-400 border-stone-500/30' };
    }
  };

  // --- HANDLERS: PHIẾU BẢO HÀNH ---
  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.serialNumberId || !claimForm.issueDescription) {
      showToast('error', 'Vui lòng nhập ID Serial máy và mô tả lỗi đồng hồ.');
      return;
    }
    try {
      setSubmittingClaim(true);
      const res = await apiClient.post('/warranties/claims', {
        serialNumberId: Number(claimForm.serialNumberId),
        serviceId: claimForm.serviceId ? Number(claimForm.serviceId) : null,
        issueDescription: claimForm.issueDescription,
        note: claimForm.note || null,
      });
      if (res.data?.success) {
        showToast('success', 'Đã tiếp nhận yêu cầu bảo hành thành công.');
        setShowCreateClaimModal(false);
        setClaimForm({
          serialNumberId: '',
          serviceId: '',
          customerName: '',
          customerPhone: '',
          issueDescription: '',
          note: '',
        });
        fetchData();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Không thể tạo phiếu tiếp nhận bảo hành.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleUpdateClaimStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingClaim) return;
    try {
      const res = await apiClient.put(`/warranties/claims/${updatingClaim.id}/status`, {
        status: claimStatusForm.status,
        note: claimStatusForm.note,
        returnedDate: claimStatusForm.status === 'returned' ? new Date().toISOString() : null,
      });
      if (res.data?.success) {
        showToast('success', 'Đã cập nhật tiến độ bảo hành thành công.');
        setUpdatingClaim(null);
        fetchData();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Không thể cập nhật phiếu bảo hành.');
    }
  };

  // --- HANDLERS: PHIẾU SỬA CHỮA ---
  const handleCreateRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairForm.serviceId || !repairForm.serialNumberId || !repairForm.issueDescription) {
      showToast('error', 'Vui lòng chọn gói dịch vụ, ID Serial đồng hồ và mô tả lỗi.');
      return;
    }
    try {
      setSubmittingRepair(true);
      const res = await apiClient.post('/services/repairs/tickets', {
        serviceId: Number(repairForm.serviceId),
        serialNumberId: Number(repairForm.serialNumberId),
        issueDescription: repairForm.issueDescription,
        cost: repairForm.cost ? Number(repairForm.cost) : 0,
        paymentStatus: repairForm.paymentStatus,
      });
      if (res.data?.success) {
        showToast('success', 'Đã lập phiếu sửa chữa thành công.');
        setShowCreateRepairModal(false);
        setRepairForm({
          serviceId: '',
          serialNumberId: '',
          customerName: '',
          customerPhone: '',
          issueDescription: '',
          cost: '',
          paymentStatus: 'unpaid',
        });
        fetchData();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Không thể lập phiếu sửa chữa.');
    } finally {
      setSubmittingRepair(false);
    }
  };

  const handleUpdateRepairStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingRepair) return;
    try {
      const res = await apiClient.put(`/services/repairs/tickets/${updatingRepair.id}/status`, {
        status: repairStatusForm.status,
        note: repairStatusForm.note,
        cost: repairStatusForm.cost ? Number(repairStatusForm.cost) : undefined,
        paymentStatus: repairStatusForm.paymentStatus,
      });
      if (res.data?.success) {
        showToast('success', 'Đã cập nhật trạng thái phiếu sửa chữa.');
        setUpdatingRepair(null);
        fetchData();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Không thể cập nhật phiếu.');
    }
  };

  // --- HANDLERS: GÓI DỊCH VỤ SỬA CHỮA ---
  const handleOpenCreateService = () => {
    setEditingService(null);
    setServiceForm({
      name: '',
      serviceType: 'service',
      basePrice: '500000',
      estimatedDays: 3,
      isActive: true,
      isWarrantyEligible: false,
    });
    setShowServiceModal(true);
  };

  const handleOpenEditService = (item: WatchServiceItem) => {
    setEditingService(item);
    setServiceForm({
      name: item.name,
      serviceType: item.serviceType,
      basePrice: String(item.basePrice),
      estimatedDays: item.estimatedDays,
      isActive: item.isActive,
      isWarrantyEligible: Boolean(item.isWarrantyEligible),
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name) {
      showToast('error', 'Tên dịch vụ không được để trống.');
      return;
    }
    try {
      setSubmittingService(true);
      const payload = {
        name: serviceForm.name,
        serviceType: serviceForm.serviceType,
        basePrice: Number(serviceForm.basePrice),
        estimatedDays: Number(serviceForm.estimatedDays),
        isActive: serviceForm.isActive,
        isWarrantyEligible: serviceForm.isWarrantyEligible,
      };

      if (editingService) {
        const res = await apiClient.put(`/services/${editingService.id}`, payload);
        if (res.data?.success) {
          showToast('success', `Đã cập nhật gói dịch vụ: ${serviceForm.name}`);
        }
      } else {
        const res = await apiClient.post('/services', payload);
        if (res.data?.success) {
          showToast('success', `Đã thêm dịch vụ sửa chữa: ${serviceForm.name}`);
        }
      }
      setShowServiceModal(false);
      fetchData();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Không thể lưu dịch vụ.');
    } finally {
      setSubmittingService(false);
    }
  };

  // --- FILTERED DATA ---
  const filteredClaims = claims.filter((claim) => {
    const serialStr = claim.serialNumber?.serial_number || claim.serialNumber?.serialNumber || '';
    const matchSearch =
      !search ||
      serialStr.toLowerCase().includes(search.toLowerCase()) ||
      claim.issueDescription.toLowerCase().includes(search.toLowerCase()) ||
      (claim.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (claim.service?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredRepairs = repairs.filter((repair) => {
    const serialStr = repair.serialNumber?.serial_number || repair.serialNumber?.serialNumber || '';
    const matchSearch =
      !search ||
      serialStr.toLowerCase().includes(search.toLowerCase()) ||
      (repair.service?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      repair.issueDescription.toLowerCase().includes(search.toLowerCase()) ||
      (repair.customer?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || repair.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredServices = services.filter((srv) => {
    const matchSearch =
      !search ||
      srv.name.toLowerCase().includes(search.toLowerCase()) ||
      srv.serviceType.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'eligible' && srv.isWarrantyEligible) ||
      (statusFilter === 'chargeable' && !srv.isWarrantyEligible);
    return matchSearch && matchStatus;
  });

  return (
    <AdminShell
      title="Bảo Hành & Phòng Kỹ Thuật Đồng Hồ"
      subtitle="Quản lý phiếu tiếp nhận bảo hành, phiếu dịch vụ sửa chữa & phân định bảo hành chính hãng"
    >
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-medium shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-950/90 text-rose-300 border-rose-500/40'
            }`}
          >
            <FontAwesomeIcon icon={toast.type === 'success' ? faCircleCheck : faCircleXmark} />
            <span>{toast.message}</span>
          </div>
        )}

        {/* TOP STATS CARDS (3 CỘT GỌN GÀNG) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="luxury-card p-4 rounded-xl border border-white/[0.08] bg-[#08100c] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#d4af37] border border-[#d4af37]/30 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faShieldHalved} className="text-base" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-stone-400">Phiếu Tiếp Nhận BH</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">{claims.length} phiếu</div>
            </div>
          </div>

          <div className="luxury-card p-4 rounded-xl border border-white/[0.08] bg-[#08100c] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faWrench} className="text-base" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-stone-400">Phiếu Sửa Chữa</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">{repairs.length} đơn</div>
            </div>
          </div>

          <div className="luxury-card p-4 rounded-xl border border-white/[0.08] bg-[#08100c] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faSliders} className="text-base" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-stone-400">Bảng Giá Dịch Vụ</div>
              <div className="text-lg font-bold text-white font-mono mt-0.5">{services.length} dịch vụ</div>
            </div>
          </div>
        </div>

        {/* TABS & ACTIONS TOOLBAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('claims');
                setStatusFilter('all');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'claims'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b38f28] text-black shadow-md'
                  : 'bg-white/[0.04] text-stone-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <FontAwesomeIcon icon={faShieldHalved} />
              <span>Phiếu Bảo Hành</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                {claims.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('repairs');
                setStatusFilter('all');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'repairs'
                  ? 'bg-gradient-to-r from-[#00844e] to-[#006039] text-white shadow-md border border-emerald-400/30'
                  : 'bg-white/[0.04] text-stone-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <FontAwesomeIcon icon={faWrench} />
              <span>Phiếu Sửa Chữa</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                {repairs.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('services');
                setStatusFilter('all');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-md border border-purple-400/30'
                  : 'bg-white/[0.04] text-stone-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <FontAwesomeIcon icon={faSliders} />
              <span>Bảng Giá & Hạng Mục Dịch Vụ</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                {services.length}
              </span>
            </button>
          </div>

          {/* Action Buttons based on Tab */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-400 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <FontAwesomeIcon icon={faRotateRight} className={loading ? 'animate-spin' : ''} />
            </button>

            {canManage && activeTab === 'claims' && (
              <button
                onClick={() => setShowCreateClaimModal(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c69f2e] to-[#b38f28] text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:scale-102 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Tiếp Nhận Bảo Hành</span>
              </button>
            )}

            {canManage && activeTab === 'repairs' && (
              <button
                onClick={() => setShowCreateRepairModal(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00844e] to-[#006039] text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-102 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Lập Phiếu Sửa Chữa</span>
              </button>
            )}

            {canManage && activeTab === 'services' && (
              <button
                onClick={handleOpenCreateService}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-102 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Thêm Dịch Vụ Mới</span>
              </button>
            )}
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder={
                activeTab === 'claims'
                  ? 'Tìm theo số Serial, tên khách hàng, lỗi báo hoặc hạng mục bảo hành...'
                  : activeTab === 'repairs'
                  ? 'Tìm theo mã sửa chữa, số serial máy, tên khách, tên dịch vụ...'
                  : 'Tìm theo tên dịch vụ, loại kỹ thuật...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#050907] rounded-xl border border-white/[0.08] text-xs font-mono text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-[#d4af37]/60"
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"
            />
          </div>

          {/* Status Filter for Claims */}
          {activeTab === 'claims' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#050907] rounded-xl border border-white/[0.08] text-xs font-mono text-stone-300 focus:outline-none focus:border-[#d4af37]/60 cursor-pointer"
            >
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="received">Đã Tiếp Nhận Máy</option>
              <option value="processing">Đang Xử Lý & Đo Kiểm</option>
              <option value="resolved">Đã Khắc Phục Xong</option>
              <option value="returned">Đã Bàn Giao Khách</option>
              <option value="cancelled">Từ Chối / Đã Hủy</option>
            </select>
          )}

          {/* Status Filter for Repairs */}
          {activeTab === 'repairs' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#050907] rounded-xl border border-white/[0.08] text-xs font-mono text-stone-300 focus:outline-none focus:border-[#d4af37]/60 cursor-pointer"
            >
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="received">Đã Tiếp Nhận Máy</option>
              <option value="inspecting">Đang Đo Kiểm Định</option>
              <option value="in_progress">Đang Gia Công & Sửa</option>
              <option value="completed">Đã Hoàn Thành</option>
              <option value="delivered">Đã Giao Trả Khách</option>
              <option value="cancelled">Đã Hủy Phiếu</option>
            </select>
          )}

          {/* Filter for Services */}
          {activeTab === 'services' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#050907] rounded-xl border border-white/[0.08] text-xs font-mono text-stone-300 focus:outline-none focus:border-[#d4af37]/60 cursor-pointer"
            >
              <option value="all">Tất Cả Hạng Mục</option>
              <option value="eligible">Chỉ dịch vụ BH Miễn Phí (is_warranty_eligible = 1)</option>
              <option value="chargeable">Chỉ dịch vụ Luôn Tính Phí</option>
            </select>
          )}
        </div>

        {/* TAB 1: PHIẾU BẢO HÀNH (WARRANTY CLAIMS) */}
        {activeTab === 'claims' && (
          <div className="space-y-4">
            {filteredClaims.length === 0 ? (
              <div className="luxury-card p-12 text-center rounded-2xl border border-white/[0.06] bg-[#070e0a]">
                <FontAwesomeIcon icon={faShieldHalved} className="text-3xl text-stone-600 mb-3" />
                <h4 className="text-sm font-serif text-stone-300">Không có phiếu bảo hành nào</h4>
                <p className="text-xs text-stone-500 mt-1 font-light">
                  Chưa có phiếu tiếp nhận bảo hành nào khớp với tiêu chí tìm kiếm.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredClaims.map((claim) => {
                  const badge = getClaimStatusBadge(claim.status);
                  const serialStr = claim.serialNumber?.serial_number || claim.serialNumber?.serialNumber || 'Chưa định danh';
                  return (
                    <div
                      key={claim.id}
                      className="luxury-card p-5 rounded-2xl border border-white/[0.08] bg-[#08120e] hover:border-[#d4af37]/35 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Header: ID & Badge */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#d4af37]">
                              #BH-{String(claim.id).padStart(4, '0')}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {formatDate(claim.thoiDiemBaoHanh || claim.createdAt)}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>

                        {/* Serial & Service Category */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                            <FontAwesomeIcon icon={faHashtag} className="text-[#d4af37] text-[10px]" />
                            <span className="font-mono">{serialStr}</span>
                          </div>
                          {claim.service && (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                              <FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" />
                              <span>Hạng mục: {claim.service.name}</span>
                              {claim.service.isWarrantyEligible && (
                                <span className="text-[9px] bg-emerald-500/20 px-1.5 rounded">Miễn phí</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Issue description */}
                        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-mono block mb-1">
                            Lỗi Khách Hàng Báo
                          </span>
                          <p className="text-stone-300 font-light leading-relaxed line-clamp-3">
                            {claim.issueDescription}
                          </p>
                        </div>

                        {/* Note from technician */}
                        {claim.note && (
                          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-300/90 font-mono">
                            <span className="font-semibold text-amber-400">Ghi chú KT: </span>
                            {claim.note}
                          </div>
                        )}

                        {/* Customer & Staff */}
                        <div className="text-[11px] font-mono text-stone-400 space-y-1 pt-1">
                          {claim.customer && (
                            <div className="flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faUser} className="text-[10px] text-stone-500" />
                              <span className="text-stone-300">{claim.customer.name}</span>
                              {claim.customer.phone && <span>({claim.customer.phone})</span>}
                            </div>
                          )}
                          {claim.staff && (
                            <div className="flex items-center gap-1.5 text-stone-500 text-[10px]">
                              <span>Tiếp nhận: {claim.staff.name} [{claim.staff.staffCode}]</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
                        {claim.returnedDate ? (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <FontAwesomeIcon icon={faCheck} />
                            <span>Đã trả ngày: {formatDate(claim.returnedDate)}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-stone-500">
                            {claim.ngayDuKienTraMay ? `Hẹn trả: ${formatDate(claim.ngayDuKienTraMay)}` : 'Chưa hẹn ngày trả'}
                          </span>
                        )}

                        {canManage && (
                          <button
                            onClick={() => {
                              setUpdatingClaim(claim);
                              setClaimStatusForm({
                                status: claim.status,
                                note: claim.note || '',
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-[#d4af37]/20 border border-white/[0.08] hover:border-[#d4af37]/40 text-stone-300 hover:text-[#d4af37] transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="text-[11px]" />
                            <span>Cập Nhật Tiến Độ</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PHIẾU SỬA CHỮA (REPAIR TICKETS) */}
        {activeTab === 'repairs' && (
          <div className="space-y-4">
            {filteredRepairs.length === 0 ? (
              <div className="luxury-card p-12 text-center rounded-2xl border border-white/[0.06] bg-[#070e0a]">
                <FontAwesomeIcon icon={faWrench} className="text-3xl text-stone-600 mb-3" />
                <h4 className="text-sm font-serif text-stone-300">Không có phiếu sửa chữa nào</h4>
                <p className="text-xs text-stone-500 mt-1 font-light">
                  Chưa có đơn sửa chữa dịch vụ nào khớp với tiêu chí tìm kiếm.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredRepairs.map((repair) => {
                  const badge = getRepairStatusBadge(repair.status);
                  const isPaid = repair.paymentStatus === 'paid';
                  const serialStr = repair.serialNumber?.serial_number || repair.serialNumber?.serialNumber || 'Chưa định danh';
                  return (
                    <div
                      key={repair.id}
                      className="luxury-card p-5 rounded-2xl border border-white/[0.08] bg-[#08120e] hover:border-emerald-500/35 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Header: ID, Date & Badge */}
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              #SC-{String(repair.id).padStart(4, '0')}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {formatDate(repair.receivedDate || repair.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                                isPaid
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>
                        </div>

                        {/* Service name & Cost */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold text-white tracking-wide block">
                              {repair.service?.name || 'Dịch vụ sửa chữa'}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1 mt-0.5">
                              <FontAwesomeIcon icon={faHashtag} className="text-[9px]" />
                              <span>Serial: {serialStr}</span>
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-stone-500 font-mono block">Chi phí:</span>
                            <span className="font-mono text-sm font-bold text-[#d4af37]">
                              {formatVND(repair.cost || repair.service?.basePrice || 0)}
                            </span>
                          </div>
                        </div>

                        {/* Issue description */}
                        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] text-xs">
                          <span className="text-[10px] text-stone-500 uppercase font-mono block mb-1">
                            Tình Trạng Lỗi Khách Báo
                          </span>
                          <p className="text-stone-300 font-light leading-relaxed line-clamp-3">
                            {repair.issueDescription}
                          </p>
                        </div>

                        {/* Technician note */}
                        {repair.note && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-[11px] text-emerald-300/90 font-mono">
                            <span className="font-semibold text-emerald-400">Ghi chú KT: </span>
                            {repair.note}
                          </div>
                        )}

                        {/* Customer & Staff */}
                        <div className="text-[11px] font-mono text-stone-400 space-y-1 pt-1">
                          {repair.customer && (
                            <div className="flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faUser} className="text-[10px] text-stone-500" />
                              <span className="text-stone-300">{repair.customer.name}</span>
                              {repair.customer.phone && <span>({repair.customer.phone})</span>}
                            </div>
                          )}
                          {repair.staff && (
                            <div className="flex items-center gap-1.5 text-stone-500 text-[10px]">
                              <span>Kỹ thuật viên: {repair.staff.name} [{repair.staff.staffCode}]</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono text-stone-500">
                          {repair.appointmentDate ? `Hẹn trả: ${formatDate(repair.appointmentDate)}` : 'Hẹn linh hoạt'}
                        </span>

                        {canManage && (
                          <button
                            onClick={() => {
                              setUpdatingRepair(repair);
                              setRepairStatusForm({
                                status: repair.status,
                                cost: String(repair.cost || repair.service?.basePrice || '0'),
                                paymentStatus: repair.paymentStatus || 'unpaid',
                                note: repair.note || '',
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-emerald-500/20 border border-white/[0.08] hover:border-emerald-500/40 text-stone-300 hover:text-emerald-300 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className="text-[11px]" />
                            <span>Cập Nhật Phiếu</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BẢNG GIÁ DỊCH VỤ SỬA CHỮA (WATCH SERVICES) */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-stone-300 flex items-start gap-3">
              <FontAwesomeIcon icon={faSliders} className="text-purple-400 text-base mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-purple-300">Phân Định Hạng Mục Dịch Vụ & Bảo Hành Miễn Phí</span>
                <p className="text-stone-400 font-light leading-relaxed">
                  Các dịch vụ được đánh dấu <strong>Áp dụng bảo hành miễn phí (<code>is_warranty_eligible = 1</code>)</strong> sẽ được hệ thống áp dụng miễn phí 0đ khi khách hàng mang đồng hồ còn hạn bảo hành đến xử lý.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredServices.map((item) => (
                <div
                  key={item.id}
                  className="luxury-card p-5 rounded-2xl border border-white/[0.08] bg-[#08120e] hover:border-purple-500/35 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                        {item.serviceType}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${
                        item.isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                          : 'bg-stone-500/15 text-stone-400 border-stone-500/35'
                      }`}>
                        {item.isActive ? 'Kinh Doanh' : 'Tạm Dừng'}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white tracking-wide">
                      {item.name}
                    </h4>

                    {/* Warranty Eligibility Badge */}
                    <div className="pt-1">
                      {item.isWarrantyEligible ? (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
                          <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
                          <span>Thuộc phạm vi BH miễn phí (0đ khi còn hạn)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-stone-500/10 border border-white/[0.06] text-[11px] font-mono text-stone-400">
                          <FontAwesomeIcon icon={faMoneyBillWave} className="text-xs text-stone-500" />
                          <span>Dịch vụ tính phí ngoài</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/40 border border-white/[0.04] text-xs">
                      <span className="text-stone-400">Đơn giá niêm yết:</span>
                      <span className="font-mono font-bold text-[#d4af37]">
                        {formatVND(item.basePrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/40 border border-white/[0.04] text-xs">
                      <span className="text-stone-400">Thời gian xử lý:</span>
                      <span className="font-mono font-medium text-stone-200">
                        {item.estimatedDays} Ngày làm việc
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.05] flex items-center justify-end">
                    {canManage && (
                      <button
                        onClick={() => handleOpenEditService(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-purple-500/20 border border-white/[0.08] hover:border-purple-500/40 text-stone-300 hover:text-purple-300 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} className="text-[11px]" />
                        <span>Sửa Gói Dịch Vụ</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL 1: TIẾP NHẬN BẢO HÀNH MỚI */}
        {showCreateClaimModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="luxury-card w-full max-w-lg rounded-2xl p-6 border border-[#d4af37]/35 bg-[#09110d] shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 flex items-center justify-center">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Tiếp Nhận Bảo Hành Đồng Hồ
                    </h3>
                    <p className="text-[10px] text-stone-400">Ghi nhận thông tin lỗi & phát hành phiếu tiếp nhận</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateClaimModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <form onSubmit={handleCreateClaim} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    ID Serial Đồng Hồ Trong Hệ Thống <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="VD: 1, 2, 3..."
                    value={claimForm.serialNumberId}
                    onChange={(e) => setClaimForm({ ...claimForm, serialNumberId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                  />
                  <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                    Tra cứu ID trong trang Quản lý Kho Serial máy
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Hạng Mục Bảo Hành Áp Dụng
                  </label>
                  <select
                    value={claimForm.serviceId}
                    onChange={(e) => setClaimForm({ ...claimForm, serviceId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                  >
                    <option value="">-- Chọn hạng mục dịch vụ bảo hành --</option>
                    {services
                      .filter((s) => s.isWarrantyEligible)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} (BH Miễn phí - {s.estimatedDays} ngày)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Mô Tả Chi Tiết Tình Trạng Lỗi <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="VD: Khách báo đồng hồ chạy chậm hơn 15 giây/ngày, kim giây giật, nắp kính có hiện tượng sương mờ..."
                    value={claimForm.issueDescription}
                    onChange={(e) => setClaimForm({ ...claimForm, issueDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Ghi Chú Ban Đầu Của Kỹ Thuật Viên
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Đồng hồ nguyên vẹn nắp đáy, mặt kính sapphire không xước..."
                    value={claimForm.note}
                    onChange={(e) => setClaimForm({ ...claimForm, note: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateClaimModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#c49f32] text-black text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingClaim && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />}
                    <span>Phát Hành Phiếu Tiếp Nhận</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CẬP NHẬT TRẠNG THÁI PHIẾU BẢO HÀNH */}
        {updatingClaim && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="luxury-card w-full max-w-md rounded-2xl p-6 border border-white/[0.1] bg-[#09110d] shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-sm font-bold text-white">
                  Cập Nhật Tiến Độ Phiếu #BH-{String(updatingClaim.id).padStart(4, '0')}
                </h3>
                <button
                  onClick={() => setUpdatingClaim(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <form onSubmit={handleUpdateClaimStatus} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Trạng Thái Xử Lý (Chuẩn Hệ Thống)
                  </label>
                  <select
                    value={claimStatusForm.status}
                    onChange={(e) => setClaimStatusForm({ ...claimStatusForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                  >
                    <option value="received">Đã Tiếp Nhận Máy</option>
                    <option value="processing">Đang Xử Lý & Đo Kiểm Định Sai Số</option>
                    <option value="resolved">Đã Khắc Phục Xong (Sẵn Sàng Trả Khách)</option>
                    <option value="returned">Đã Bàn Giao Lại Máy Cho Khách Hàng</option>
                    <option value="cancelled">Từ Chối Bảo Hành / Hủy Phiếu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Ghi Chú Tiến Độ / Kết Quả Đo Kiểm Định
                  </label>
                  <textarea
                    rows={3}
                    value={claimStatusForm.note}
                    onChange={(e) => setClaimStatusForm({ ...claimStatusForm, note: e.target.value })}
                    placeholder="VD: Đã cân chỉnh sai số về +1s/ngày, hoàn tất test nước áp suất 30 bar, vệ sinh vỏ máy..."
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUpdatingClaim(null)}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#d4af37] text-black text-xs font-bold shadow-md cursor-pointer"
                  >
                    Lưu Tiến Độ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: LẬP PHIẾU SỬA CHỮA MỚI */}
        {showCreateRepairModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="luxury-card w-full max-w-lg rounded-2xl p-6 border border-emerald-500/40 bg-[#09110d] shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <FontAwesomeIcon icon={faWrench} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Lập Phiếu Sửa Chữa Dịch Vụ
                    </h3>
                    <p className="text-[10px] text-stone-400">Tiếp nhận sửa chữa dịch vụ tính phí hoặc bảo dưỡng</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateRepairModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <form onSubmit={handleCreateRepair} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Chọn Gói Dịch Vụ Sửa Chữa <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={repairForm.serviceId}
                    onChange={(e) => {
                      const selected = services.find((s) => s.id === Number(e.target.value));
                      setRepairForm({
                        ...repairForm,
                        serviceId: e.target.value,
                        cost: selected ? String(selected.basePrice) : repairForm.cost,
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="">-- Chọn dịch vụ sửa chữa --</option>
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.name} ({formatVND(srv.basePrice)} - Dự kiến {srv.estimatedDays} ngày)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    ID Serial Chiếc Đồng Hồ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="VD: 1, 2, 3..."
                    value={repairForm.serialNumberId}
                    onChange={(e) => setRepairForm({ ...repairForm, serialNumberId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Chi Phí Sửa Chữa (VNĐ)
                    </label>
                    <input
                      type="number"
                      placeholder="VD: 500000"
                      value={repairForm.cost}
                      onChange={(e) => setRepairForm({ ...repairForm, cost: e.target.value })}
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Tình Trạng Thanh Toán
                    </label>
                    <select
                      value={repairForm.paymentStatus}
                      onChange={(e) => setRepairForm({ ...repairForm, paymentStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-emerald-500/60"
                    >
                      <option value="unpaid">Chưa Thanh Toán</option>
                      <option value="paid">Đã Thu Tiền</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Mô Tả Tình Trạng Lỗi Khách Báo <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="VD: Vỏ xước sâu tại vị trí 4h, cần đánh bóng phục hồi & thay gioăng cao su chống nước..."
                    value={repairForm.issueDescription}
                    onChange={(e) => setRepairForm({ ...repairForm, issueDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateRepairModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRepair}
                    className="px-4 py-2 rounded-lg bg-[#00844e] hover:bg-[#006e41] text-white text-xs font-semibold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingRepair && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />}
                    <span>Tạo Phiếu Sửa Chữa</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: CẬP NHẬT TRẠNG THÁI PHIẾU SỬA CHỮA */}
        {updatingRepair && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="luxury-card w-full max-w-md rounded-2xl p-6 border border-white/[0.1] bg-[#09110d] shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-sm font-bold text-white">
                  Cập Nhật Phiếu Sửa Chữa #SC-{String(updatingRepair.id).padStart(4, '0')}
                </h3>
                <button
                  onClick={() => setUpdatingRepair(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <form onSubmit={handleUpdateRepairStatus} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Trạng Thái Phiếu (Chuẩn Database)
                  </label>
                  <select
                    value={repairStatusForm.status}
                    onChange={(e) => setRepairStatusForm({ ...repairStatusForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="received">Đã Tiếp Nhận Đồng Hồ</option>
                    <option value="inspecting">Đang Đo Kiểm Định Máy</option>
                    <option value="in_progress">Đang Gia Công & Sửa Chữa</option>
                    <option value="completed">Đã Hoàn Thành Sửa Chữa</option>
                    <option value="delivered">Đã Bàn Giao Khách Hàng</option>
                    <option value="cancelled">Hủy Phiếu</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Chi Phí Thực Tế (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={repairStatusForm.cost}
                      onChange={(e) => setRepairStatusForm({ ...repairStatusForm, cost: e.target.value })}
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Thanh Toán
                    </label>
                    <select
                      value={repairStatusForm.paymentStatus}
                      onChange={(e) => setRepairStatusForm({ ...repairStatusForm, paymentStatus: e.target.value })}
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-emerald-500/60"
                    >
                      <option value="unpaid">Chưa Thu Tiền</option>
                      <option value="paid">Đã Thu Tiền</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Ghi Chú Kỹ Thuật
                  </label>
                  <textarea
                    rows={3}
                    value={repairStatusForm.note}
                    onChange={(e) => setRepairStatusForm({ ...repairStatusForm, note: e.target.value })}
                    placeholder="VD: Đã thay gioăng cao su chống nước, kiểm tra sai số máy đạt chuẩn..."
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUpdatingRepair(null)}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#00844e] text-white text-xs font-semibold shadow-md cursor-pointer"
                  >
                    Lưu Trạng Thái
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: THÊM / SỬA GÓI DỊCH VỤ SỬA CHỮA */}
        {showServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="luxury-card w-full max-w-md rounded-2xl p-6 border border-purple-500/40 bg-[#09110d] shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                    <FontAwesomeIcon icon={faSliders} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {editingService ? 'Chỉnh Sửa Gói Dịch Vụ' : 'Thêm Dịch Vụ Sửa Chữa Mới'}
                    </h3>
                    <p className="text-[10px] text-stone-400">Thiết lập đơn giá & quyền hưởng bảo hành miễn phí</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Tên Gói Dịch Vụ <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Thay pin chuẩn Thụy Sĩ, Đánh bóng vỏ cỗ máy..."
                    value={serviceForm.name}
                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-purple-500/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Loại Nghiệp Vụ
                    </label>
                    <select
                      value={serviceForm.serviceType}
                      onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-purple-500/60"
                    >
                      <option value="service">Bảo Dưỡng Toàn Diện</option>
                      <option value="repair">Sửa Chữa Máy Cơ</option>
                      <option value="battery">Thay Pin</option>
                      <option value="polish">Đánh Bóng & Phục Hồi</option>
                      <option value="waterproof">Kiểm Tra Chống Nước</option>
                      <option value="strap">Thay Dây Da / Kim Loại</option>
                      <option value="resize">Cắt / Rút Mắt Dây</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Đơn Giá Niêm Yết (VNĐ)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={serviceForm.basePrice}
                      onChange={(e) => setServiceForm({ ...serviceForm, basePrice: e.target.value })}
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-purple-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Thời Gian Xử Lý Dự Kiến (Ngày Làm Việc)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={serviceForm.estimatedDays}
                    onChange={(e) => setServiceForm({ ...serviceForm, estimatedDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-purple-500/60"
                  />
                </div>

                {/* IS_WARRANTY_ELIGIBLE CHECKBOX */}
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isWarrantyEligible"
                      checked={serviceForm.isWarrantyEligible}
                      onChange={(e) => setServiceForm({ ...serviceForm, isWarrantyEligible: e.target.checked })}
                      className="rounded border-emerald-500 text-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="isWarrantyEligible" className="text-emerald-300 font-semibold text-xs cursor-pointer">
                      Áp dụng bảo hành miễn phí (is_warranty_eligible = 1)
                    </label>
                  </div>
                  <p className="text-[10px] text-stone-400 pl-5 font-light leading-relaxed">
                    Nếu bật tùy chọn này, dịch vụ sẽ được xem là một trường hợp được hưởng bảo hành miễn phí (0đ) khi máy còn thời hạn bảo hành.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActiveService"
                    checked={serviceForm.isActive}
                    onChange={(e) => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                    className="rounded border-white/20 text-purple-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isActiveService" className="text-stone-300 text-xs cursor-pointer">
                    Kích hoạt dịch vụ này trên bảng giá niêm yết
                  </label>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingService}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submittingService && <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />}
                    <span>{editingService ? 'Cập Nhật Dịch Vụ' : 'Thêm Dịch Vụ'}</span>
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
