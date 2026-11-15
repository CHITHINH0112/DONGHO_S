'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserTie,
  faUsers,
  faPlus,
  faCircleCheck,
  faCircleXmark,
  faRotateRight,
  faMagnifyingGlass,
  faEnvelope,
  faPhone,
  faLocationDot,
  faBoxesStacked,
  faWrench,
  faCashRegister,
  faCrown,
  faBan,
  faLock,
  faLockOpen,
  faUserShield,
  faKey,
  faXmark,
  faSpinner,
  faCheck,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';
import apiClient from '@/lib/axios';

interface UserAddress {
  id: number;
  receiverName?: string;
  phone?: string;
  address?: string;
  detailAddress?: string;
  isDefault?: boolean;
}

interface CustomerUser {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  status: 'active' | 'inactive' | 'banned' | string;
  createdAt: string;
  addresses?: UserAddress[];
}

interface StaffMember {
  id: number;
  staffCode: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'admin' | 'staff' | string;
  position: 'manager' | 'sales' | 'warehouse' | 'technician' | string;
  isActive: boolean;
  createdAt?: string;
}

export default function AccountManagementPage() {
  const [activeTab, setActiveTab] = useState<'customers' | 'staff'>('customers');

  // Dữ liệu
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Bộ lọc tìm kiếm
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal tạo nhân viên mới
  const [showCreateStaffModal, setShowCreateStaffModal] = useState<boolean>(false);
  const [submittingStaff, setSubmittingStaff] = useState<boolean>(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    staffCode: '',
    phone: '',
    position: 'sales' as 'manager' | 'sales' | 'warehouse' | 'technician',
    role: 'staff' as 'admin' | 'staff',
  });

  // Modal chỉnh sửa thông tin nhân viên
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [submittingEditStaff, setSubmittingEditStaff] = useState<boolean>(false);
  const [editStaffForm, setEditStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'sales' as 'manager' | 'sales' | 'warehouse' | 'technician',
    role: 'staff' as 'admin' | 'staff',
    password: '',
    isActive: true,
  });

  const handleOpenEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEditStaffForm({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      position: (staff.position as any) || 'sales',
      role: (staff.role as any) || 'staff',
      password: '',
      isActive: staff.isActive,
    });
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!editStaffForm.name.trim() || !editStaffForm.email.trim()) {
      showToast('error', 'Họ tên và email không được để trống.');
      return;
    }

    try {
      setSubmittingEditStaff(true);
      const payload: any = {
        name: editStaffForm.name.trim(),
        email: editStaffForm.email.trim(),
        phone: editStaffForm.phone.trim(),
        position: editStaffForm.position,
        role: editStaffForm.role,
        isActive: editStaffForm.isActive,
      };
      if (editStaffForm.password.trim()) {
        payload.password = editStaffForm.password.trim();
      }

      const res = await apiClient.put(`/admin/staff/${editingStaff.id}`, payload);
      if (res.data?.success) {
        showToast('success', `Đã cập nhật thông tin nhân sự: ${editStaffForm.name}`);
        setEditingStaff(null);
        fetchData();
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Không thể cập nhật thông tin nhân viên.');
    } finally {
      setSubmittingEditStaff(false);
    }
  };

  // Modal xem sổ địa chỉ khách hàng
  const [selectedCustomerAddresses, setSelectedCustomerAddresses] = useState<{
    customerName: string;
    addresses: UserAddress[];
  } | null>(null);

  // Toast thông báo
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Tải dữ liệu từ API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, staffRes] = await Promise.allSettled([
        apiClient.get('/users'),
        apiClient.get('/admin/staff'),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value.data?.success) {
        setCustomers(usersRes.value.data.data || []);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value.data?.success) {
        setStaffList(staffRes.value.data.data || []);
      }
    } catch {
      showToast('error', 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý tạo nhân viên mới
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.email.trim() || !staffForm.staffCode.trim()) {
      showToast('error', 'Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }
    if (!staffForm.password.trim() || staffForm.password.length < 6) {
      showToast('error', 'Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    try {
      setSubmittingStaff(true);
      const res = await apiClient.post('/admin/staff', staffForm);
      if (res.data?.success) {
        showToast('success', `Đã tạo tài khoản nhân sự: ${staffForm.name} (#${staffForm.staffCode})`);
        setShowCreateStaffModal(false);
        setStaffForm({
          name: '',
          email: '',
          password: '',
          staffCode: '',
          phone: '',
          position: 'sales',
          role: 'staff',
        });
        await fetchData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể tạo nhân sự.';
      showToast('error', msg);
    } finally {
      setSubmittingStaff(false);
    }
  };

  // Xử lý Khóa / Mở khóa tài khoản khách hàng
  const handleToggleCustomerStatus = async (user: CustomerUser) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned';
    try {
      const res = await apiClient.put(`/users/${user.id}/status`, { status: newStatus });
      if (res.data?.success) {
        showToast(
          'success',
          `Đã ${newStatus === 'banned' ? 'khóa' : 'mở khóa'} tài khoản của ${user.name}`
        );
        setCustomers((prev) =>
          prev.map((c) => (c.id === user.id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi cập nhật trạng thái.';
      showToast('error', msg);
    }
  };

  // Xử lý Bật / Tắt trạng thái nhân viên
  const handleToggleStaffStatus = async (staff: StaffMember) => {
    try {
      const res = await apiClient.put(`/admin/staff/${staff.id}`, { isActive: !staff.isActive });
      if (res.data?.success) {
        showToast(
          'success',
          `Đã ${!staff.isActive ? 'kích hoạt' : 'tạm ngưng'} tài khoản của ${staff.name}`
        );
        setStaffList((prev) =>
          prev.map((s) => (s.id === staff.id ? { ...s, isActive: !staff.isActive } : s))
        );
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi cập nhật trạng thái nhân viên.';
      showToast('error', msg);
    }
  };

  // Định dạng chức vụ
  const getPositionInfo = (position?: string) => {
    switch (position) {
      case 'manager':
        return {
          label: 'Tổng Quản Lý Boutique',
          badge: 'bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/35',
          icon: faCrown,
        };
      case 'warehouse':
        return {
          label: 'Quản Lý Kho & Serial',
          badge: 'bg-amber-500/15 text-amber-400 border-amber-500/35',
          icon: faBoxesStacked,
        };
      case 'sales':
        return {
          label: 'Tư Vấn & Thu Ngân',
          badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35',
          icon: faCashRegister,
        };
      case 'technician':
        return {
          label: 'Kỹ Thuật Viên Đồng Hồ',
          badge: 'bg-sky-500/15 text-sky-400 border-sky-500/35',
          icon: faWrench,
        };
      default:
        return {
          label: 'Nhân Viên Nội Bộ',
          badge: 'bg-stone-500/15 text-stone-300 border-stone-500/35',
          icon: faUserTie,
        };
    }
  };

  // Lọc dữ liệu khách hàng
  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search));
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Lọc dữ liệu nhân viên
  const filteredStaff = staffList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.staffCode.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && s.isActive) ||
      (statusFilter === 'inactive' && !s.isActive);
    return matchSearch && matchStatus;
  });

  return (
    <AdminShell
      title="Trung Tâm Quản Lý Tài Khoản"
      subtitle="Quản trị khách hàng đăng ký, phân quyền nhân sự và cấu hình thẩm quyền bảo mật"
    >
      <div className="space-y-6">
        {/* Toast thông báo */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40'
                : 'bg-red-950/90 border-red-500/50 text-red-300 shadow-red-950/40'
            }`}
          >
            <FontAwesomeIcon
              icon={toast.type === 'success' ? faCircleCheck : faCircleXmark}
              className="text-base"
            />
            <span className="font-medium tracking-wide">{toast.message}</span>
          </div>
        )}

        {/* KPI Cards Thống kê tài khoản */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="luxury-card rounded-xl p-4 border border-white/[0.08] bg-[#08100c]">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Tổng Khách Hàng</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white mt-2">{customers.length}</p>
            <span className="text-[10px] text-emerald-400 mt-1 block">Tài khoản mua hàng</span>
          </div>

          <div className="luxury-card rounded-xl p-4 border border-white/[0.08] bg-[#08100c]">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Khách Hoạt Động</span>
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center">
                <FontAwesomeIcon icon={faCircleCheck} />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white mt-2">
              {customers.filter((c) => c.status === 'active').length}
            </p>
            <span className="text-[10px] text-[#d4af37] mt-1 block">Tài khoản hợp lệ</span>
          </div>

          <div className="luxury-card rounded-xl p-4 border border-white/[0.08] bg-[#08100c]">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Tổng Nhân Sự</span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <FontAwesomeIcon icon={faUserTie} />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white mt-2">{staffList.length}</p>
            <span className="text-[10px] text-sky-400 mt-1 block">Toàn chuỗi Boutique</span>
          </div>

          <div className="luxury-card rounded-xl p-4 border border-white/[0.08] bg-[#08100c]">
            <div className="flex items-center justify-between text-stone-400 text-xs">
              <span>Thủ Kho & Serial</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FontAwesomeIcon icon={faBoxesStacked} />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white mt-2">
              {staffList.filter((s) => s.position === 'warehouse').length}
            </p>
            <span className="text-[10px] text-amber-400 mt-1 block">Bộ phận kiểm kho</span>
          </div>
        </div>

        {/* Tab Controls & Actions */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('customers');
                setStatusFilter('all');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-gradient-to-r from-[#00844e] to-[#006039] text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30'
                  : 'bg-white/[0.04] text-stone-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <FontAwesomeIcon icon={faUsers} />
              <span>Tài Khoản Khách Hàng</span>
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-black/30 font-mono text-[10px]">
                {customers.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('staff');
                setStatusFilter('all');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-gradient-to-r from-[#00844e] to-[#006039] text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30'
                  : 'bg-white/[0.04] text-stone-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <FontAwesomeIcon icon={faUserTie} />
              <span>Nhân Sự & Phân Quyền</span>
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-black/30 font-mono text-[10px]">
                {staffList.length}
              </span>
            </button>
          </div>

          {/* Search, Filter & Quick Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  activeTab === 'customers'
                    ? 'Tìm tên khách, email, SĐT...'
                    : 'Tìm tên NV, mã NV, email...'
                }
                className="w-full pl-9 pr-3 py-2 bg-[#0c1611] rounded-lg border border-white/[0.08] text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#d4af37]/50"
              />
            </div>

            <button
              onClick={fetchData}
              title="Làm mới dữ liệu"
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-stone-300 hover:text-[#d4af37] text-xs transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faRotateRight} className={loading ? 'animate-spin' : ''} />
            </button>

            {activeTab === 'staff' && (
              <button
                onClick={() => setShowCreateStaffModal(true)}
                className="px-3.5 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/30 border border-emerald-400/30 transition-all cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span>Thêm Nhân Sự</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: DANH SÁCH KHÁCH HÀNG */}
        {activeTab === 'customers' && (
          <div className="luxury-card rounded-2xl border border-white/[0.08] bg-[#08100c] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-[#0c1611]/80 text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                    <th className="py-3 px-4">Khách Hàng</th>
                    <th className="py-3 px-4">Thông Tin Liên Hệ</th>
                    <th className="py-3 px-4">Sổ Địa Chỉ</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {loading && customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg text-[#d4af37]" />
                        <p className="mt-2 text-xs">Đang tải danh sách khách hàng...</p>
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400">
                        <p className="text-xs">Không tìm thấy khách hàng nào phù hợp.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((user) => {
                      const isBanned = user.status === 'banned';
                      return (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#d4af37]/30 to-[#00844e]/40 p-[1.5px] shrink-0">
                                <div className="w-full h-full rounded-full bg-[#070e0a] flex items-center justify-center font-bold text-xs text-[#d4af37]">
                                  {user.name.substring(0, 2).toUpperCase()}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-stone-100 block">{user.name}</span>
                                <span className="text-[10px] text-stone-500 font-mono">
                                  ID: #{user.id} • {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 space-y-0.5">
                            <div className="flex items-center gap-2 text-stone-300">
                              <FontAwesomeIcon icon={faEnvelope} className="text-stone-500 text-[10px]" />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                                <FontAwesomeIcon icon={faPhone} className="text-stone-500 text-[10px]" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              onClick={() =>
                                setSelectedCustomerAddresses({
                                  customerName: user.name,
                                  addresses: user.addresses || [],
                                })
                              }
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-[11px] ${
                                user.addresses && user.addresses.length > 0
                                  ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-stone-200 hover:text-white'
                                  : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.05] text-stone-400'
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={faLocationDot}
                                className={user.addresses && user.addresses.length > 0 ? 'text-[#d4af37]' : 'text-stone-500'}
                              />
                              <span>
                                {user.addresses && user.addresses.length > 0
                                  ? `${user.addresses.length} địa chỉ`
                                  : '0 địa chỉ'}
                              </span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                isBanned
                                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              <FontAwesomeIcon icon={isBanned ? faBan : faCircleCheck} className="text-[9px]" />
                              <span>{isBanned ? 'Bị Khóa (Banned)' : 'Đang Hoạt Động'}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleToggleCustomerStatus(user)}
                              title={isBanned ? 'Mở khóa tài khoản' : 'Khóa tài khoản khách này'}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                isBanned
                                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              <FontAwesomeIcon icon={isBanned ? faLockOpen : faLock} className="mr-1.5 text-[10px]" />
                              <span>{isBanned ? 'Mở Khóa' : 'Khóa'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: DANH SÁCH NHÂN SỰ & PHÂN QUYỀN */}
        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {loading && staffList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-400">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg text-[#d4af37]" />
                <p className="mt-2 text-xs">Đang tải danh sách nhân sự...</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="col-span-full py-12 text-center text-stone-400">
                <p className="text-xs">Không tìm thấy nhân viên nào phù hợp.</p>
              </div>
            ) : (
              filteredStaff.map((staff) => {
                const posInfo = getPositionInfo(staff.position);
                const PositionIcon = posInfo.icon;
                return (
                  <div
                    key={staff.id}
                    className="luxury-card rounded-2xl p-5 border border-white/[0.08] bg-[#08100c] flex flex-col justify-between space-y-4 hover:border-[#d4af37]/35 transition-all"
                  >
                    <div>
                      {/* Header Card: Avatar + Tên + Role Badge */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/[0.05]">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#00844e] p-[1.5px] shrink-0">
                            <div className="w-full h-full rounded-xl bg-[#070e0a] flex items-center justify-center font-bold text-xs text-[#d4af37]">
                              {staff.name.substring(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white tracking-wide">{staff.name}</h4>
                            <span className="text-[11px] font-mono font-medium text-amber-300">
                              #{staff.staffCode}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono font-medium border ${
                            staff.role === 'admin'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/35'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                          }`}
                        >
                          {staff.role}
                        </span>
                      </div>

                      {/* Position Tag & Contact */}
                      <div className="mt-3.5 space-y-2">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${posInfo.badge}`}
                        >
                          <FontAwesomeIcon icon={PositionIcon} className="text-[11px]" />
                          <span>{posInfo.label}</span>
                        </div>

                        <div className="space-y-1 text-xs text-stone-300 pt-1">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} className="text-stone-500 text-[10px]" />
                            <span className="truncate">{staff.email}</span>
                          </div>
                          {staff.phone && (
                            <div className="flex items-center gap-2 text-stone-400">
                              <FontAwesomeIcon icon={faPhone} className="text-stone-500 text-[10px]" />
                              <span>{staff.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer: Trạng thái & Toggle / Sửa */}
                    <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] ${
                          staff.isActive ? 'text-emerald-400 font-medium' : 'text-stone-500'
                        }`}
                      >
                        <FontAwesomeIcon icon={staff.isActive ? faCircleCheck : faCircleXmark} className="text-[10px]" />
                        <span>{staff.isActive ? 'Đang Hoạt Động' : 'Tạm Khóa'}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditStaff(staff)}
                          title="Chỉnh sửa thông tin nhân viên"
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] hover:bg-[#d4af37]/20 border border-white/[0.08] hover:border-[#d4af37]/40 text-stone-300 hover:text-[#d4af37] transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="text-[10px]" />
                          <span>Sửa</span>
                        </button>

                        <button
                          onClick={() => handleToggleStaffStatus(staff)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                            staff.isActive
                              ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-white/[0.08]'
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {staff.isActive ? 'Tạm Ngưng' : 'Kích Hoạt'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* MODAL: THÊM NHÂN SỰ MỚI */}
        {showCreateStaffModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="luxury-card w-full max-w-lg rounded-2xl p-6 border border-[#d4af37]/35 bg-[#09110d] shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUserShield} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Thêm Nhân Sự Boutique Mới
                    </h3>
                    <p className="text-[10px] text-stone-400">
                      Cấp tài khoản đăng nhập & phân quyền chuyên trách
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateStaffModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.05]"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Họ và Tên Nhân Viên (*)
                  </label>
                  <input
                    type="text"
                    required
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    placeholder="VD: Trần Văn Kho"
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Mã Nhân Viên (Staff Code) (*)
                    </label>
                    <input
                      type="text"
                      required
                      value={staffForm.staffCode}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, staffCode: e.target.value.toUpperCase() })
                      }
                      placeholder="VD: WH-002, SL-009"
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 font-mono focus:outline-none focus:border-[#d4af37]/60"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Số Điện Thoại Liên Hệ
                    </label>
                    <input
                      type="text"
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                      placeholder="VD: 0901234567"
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Email Đăng Nhập (*)
                  </label>
                  <input
                    type="email"
                    required
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="VD: kho@chronoluxe.vn"
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Mật Khẩu Khởi Tạo (*)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      placeholder="Ít nhất 6 ký tự"
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 font-mono focus:outline-none focus:border-[#d4af37]/60"
                    />
                    <FontAwesomeIcon
                      icon={faKey}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Chức Vụ Phân Công
                    </label>
                    <select
                      value={staffForm.position}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, position: e.target.value as any })
                      }
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                    >
                      <option value="warehouse">Quản Lý Kho & Serial (Thủ Kho)</option>
                      <option value="sales">Tư Vấn & Thu Ngân Trực Ca</option>
                      <option value="technician">Kỹ Thuật Viên Đồng Hồ</option>
                      <option value="manager">Tổng Quản Lý Boutique</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Quyền Hạn Hệ Thống (Role)
                    </label>
                    <select
                      value={staffForm.role}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, role: e.target.value as any })
                      }
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                    >
                      <option value="staff">Staff (Nhân viên phân quyền chuẩn)</option>
                      <option value="admin">Admin (Toàn quyền quản trị)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateStaffModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingStaff}
                    className="px-4 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all cursor-pointer"
                  >
                    {submittingStaff ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Xác Nhận Tạo Nhân Sự</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CHỈNH SỬA THÔNG TIN NHÂN SỰ */}
        {editingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="luxury-card w-full max-w-lg rounded-2xl p-6 border border-[#d4af37]/35 bg-[#09110d] shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 flex items-center justify-center">
                    <FontAwesomeIcon icon={faPenToSquare} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Chỉnh Sửa Thông Tin Nhân Viên
                    </h3>
                    <p className="text-[10px] text-stone-400">
                      Cập nhật hồ sơ tài khoản nhân sự #{editingStaff.staffCode}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingStaff(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.05]"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <form onSubmit={handleUpdateStaff} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Họ và Tên Nhân Viên (*)
                  </label>
                  <input
                    type="text"
                    required
                    value={editStaffForm.name}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Mã Nhân Viên (Cố định)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={editingStaff.staffCode}
                      className="w-full px-3 py-2 bg-white/[0.03] rounded-lg border border-white/[0.05] text-stone-400 font-mono cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Số Điện Thoại Liên Hệ
                    </label>
                    <input
                      type="text"
                      value={editStaffForm.phone}
                      onChange={(e) => setEditStaffForm({ ...editStaffForm, phone: e.target.value })}
                      placeholder="VD: 0901234567"
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Email Đăng Nhập (*)
                  </label>
                  <input
                    type="email"
                    required
                    value={editStaffForm.email}
                    onChange={(e) => setEditStaffForm({ ...editStaffForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Chức Vụ Phân Công
                    </label>
                    <select
                      value={editStaffForm.position}
                      onChange={(e) =>
                        setEditStaffForm({ ...editStaffForm, position: e.target.value as any })
                      }
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                    >
                      <option value="warehouse">Quản Lý Kho & Serial (Thủ Kho)</option>
                      <option value="sales">Tư Vấn & Thu Ngân Trực Ca</option>
                      <option value="technician">Kỹ Thuật Viên Đồng Hồ</option>
                      <option value="manager">Tổng Quản Lý Boutique</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Quyền Hạn Hệ Thống (Role)
                    </label>
                    <select
                      value={editStaffForm.role}
                      onChange={(e) =>
                        setEditStaffForm({ ...editStaffForm, role: e.target.value as any })
                      }
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                    >
                      <option value="staff">Staff (Nhân viên phân quyền chuẩn)</option>
                      <option value="admin">Admin (Toàn quyền quản trị)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Trạng Thái Hoạt Động
                    </label>
                    <select
                      value={editStaffForm.isActive ? 'active' : 'inactive'}
                      onChange={(e) =>
                        setEditStaffForm({ ...editStaffForm, isActive: e.target.value === 'active' })
                      }
                      className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 focus:outline-none focus:border-[#d4af37]/60"
                    >
                      <option value="active">Đang Hoạt Động</option>
                      <option value="inactive">Tạm Khóa Hoạt Động</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Mật Khẩu Mới (Tùy chọn)
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={editStaffForm.password}
                        onChange={(e) => setEditStaffForm({ ...editStaffForm, password: e.target.value })}
                        placeholder="Để trống nếu giữ nguyên"
                        className="w-full px-3 py-2 bg-[#050907] rounded-lg border border-white/[0.08] text-stone-200 font-mono focus:outline-none focus:border-[#d4af37]/60"
                      />
                      <FontAwesomeIcon
                        icon={faKey}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingStaff(null)}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs font-medium cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEditStaff}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b38f28] hover:from-[#e5c158] hover:to-[#c49f32] text-black text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#d4af37]/20 border border-[#d4af37]/40 transition-all cursor-pointer"
                  >
                    {submittingEditStaff ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                        <span>Đang cập nhật...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Lưu Thay Đổi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: XEM SỔ ĐỊA CHỈ KHÁCH HÀNG */}
        {selectedCustomerAddresses && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="luxury-card w-full max-w-md rounded-2xl p-6 border border-white/[0.1] bg-[#09110d] shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faLocationDot} className="text-[#d4af37]" />
                  <h3 className="text-sm font-bold text-white">
                    Sổ Địa Chỉ: {selectedCustomerAddresses.customerName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCustomerAddresses(null)}
                  className="p-1 rounded text-stone-400 hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                {selectedCustomerAddresses.addresses.length === 0 ? (
                  <div className="py-8 text-center text-stone-400">
                    <FontAwesomeIcon icon={faLocationDot} className="text-2xl text-stone-600 mb-2" />
                    <p className="text-xs">Khách hàng này hiện chưa lưu địa chỉ nào trong sổ địa chỉ.</p>
                  </div>
                ) : (
                  selectedCustomerAddresses.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-stone-100">{addr.receiverName || 'Người nhận'}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/35 font-mono">
                            Mặc định
                          </span>
                        )}
                      </div>
                      {addr.phone && (
                        <p className="text-stone-400 text-[11px] flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faPhone} className="text-stone-500 text-[9px]" />
                          <span>SĐT: {addr.phone}</span>
                        </p>
                      )}
                      <p className="text-stone-200 leading-relaxed text-[11px] flex items-start gap-1.5 pt-0.5 border-t border-white/[0.04]">
                        <FontAwesomeIcon icon={faLocationDot} className="text-[#d4af37] text-[10px] mt-0.5 shrink-0" />
                        <span>{addr.address || addr.detailAddress || 'Chưa cập nhật chi tiết'}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.08] text-right">
                <button
                  onClick={() => setSelectedCustomerAddresses(null)}
                  className="px-4 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs text-stone-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
