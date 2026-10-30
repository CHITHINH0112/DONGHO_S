import { AdminAccount } from '@/context/AdminAuthContext';

export type AdminPosition = 'manager' | 'sales' | 'warehouse' | 'technician' | string;

export type PermissionKey =
  | 'DASHBOARD_VIEW'
  | 'DASHBOARD_FINANCIALS'
  | 'PRODUCTS_VIEW'
  | 'PRODUCTS_MANAGE'
  | 'ORDERS_VIEW'
  | 'ORDERS_CREATE'
  | 'SHIFTS_VIEW'
  | 'SHIFTS_MANAGE'
  | 'WARRANTIES_VIEW'
  | 'WARRANTIES_MANAGE'
  | 'APPROVALS_VIEW'
  | 'APPROVALS_REQUEST'
  | 'APPROVALS_PROCESS'
  | 'STAFF_MANAGE'
  | 'AUDIT_LOGS_VIEW'
  | 'SETTINGS_MANAGE';

// Matrix mapping permissions to positions
const POSITION_PERMISSIONS: Record<string, PermissionKey[]> = {
  // Manager / Admin: Toàn quyền tối cao
  manager: [
    'DASHBOARD_VIEW',
    'DASHBOARD_FINANCIALS',
    'PRODUCTS_VIEW',
    'PRODUCTS_MANAGE',
    'ORDERS_VIEW',
    'ORDERS_CREATE',
    'SHIFTS_VIEW',
    'SHIFTS_MANAGE',
    'WARRANTIES_VIEW',
    'WARRANTIES_MANAGE',
    'APPROVALS_VIEW',
    'APPROVALS_REQUEST',
    'APPROVALS_PROCESS',
    'STAFF_MANAGE',
    'AUDIT_LOGS_VIEW',
    'SETTINGS_MANAGE',
  ],

  // Sales: Tư vấn bán hàng kiêm Thu ngân trực két
  sales: [
    'DASHBOARD_VIEW',
    'DASHBOARD_FINANCIALS',
    'PRODUCTS_VIEW',
    'ORDERS_VIEW',
    'ORDERS_CREATE',
    'SHIFTS_VIEW',
    'SHIFTS_MANAGE',
    'WARRANTIES_VIEW',
    'APPROVALS_VIEW',
    'APPROVALS_REQUEST',
  ],

  // Warehouse: Thủ kho, quản lý serial và nhập hàng
  warehouse: [
    'DASHBOARD_VIEW',
    'PRODUCTS_VIEW',
    'PRODUCTS_MANAGE',
    'ORDERS_VIEW', // Xem đơn để điều phối đóng gói & xuất kho
    'WARRANTIES_VIEW',
    'APPROVALS_VIEW',
    'APPROVALS_REQUEST',
  ],

  // Technician: Kỹ thuật viên đồng hồ, phòng lab bảo hành
  technician: [
    'DASHBOARD_VIEW',
    'PRODUCTS_VIEW', // Xem thông số bộ máy calibre
    'WARRANTIES_VIEW',
    'WARRANTIES_MANAGE',
    'APPROVALS_VIEW',
    'APPROVALS_REQUEST',
  ],
};

// Route permission requirements
const ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  '/': 'DASHBOARD_VIEW',
  '/products': 'PRODUCTS_VIEW',
  '/brands': 'PRODUCTS_VIEW',
  '/categories': 'PRODUCTS_VIEW',
  '/features': 'PRODUCTS_VIEW',
  '/orders': 'ORDERS_VIEW',
  '/shifts': 'SHIFTS_VIEW',
  '/warranties': 'WARRANTIES_VIEW',
  '/approvals': 'APPROVALS_VIEW',
  '/staff': 'STAFF_MANAGE',
  '/settings': 'SETTINGS_MANAGE',
};

/**
 * Kiểm tra xem admin/staff có quyền cụ thể hay không
 */
export function hasPermission(admin: AdminAccount | null, permission: PermissionKey): boolean {
  if (!admin) return false;

  // Role admin luôn có full quyền
  if (admin.role === 'admin') return true;

  const position = (admin.position || 'sales').toLowerCase();
  const permissions = POSITION_PERMISSIONS[position] || [];
  return permissions.includes(permission);
}

/**
 * Kiểm tra xem tài khoản có thể truy cập route hay không
 */
export function canAccessRoute(admin: AdminAccount | null, pathname: string): boolean {
  if (!admin) return false;
  if (admin.role === 'admin') return true;

  // Chuẩn hóa pathname (loại trừ query params)
  const cleanPath = pathname.split('?')[0];

  // Tìm permission yêu cầu cho route
  const requiredPermission = ROUTE_PERMISSIONS[cleanPath];
  if (!requiredPermission) {
    // Nếu route con, ví dụ /products/123
    const parentRoute = Object.keys(ROUTE_PERMISSIONS).find(
      (r) => r !== '/' && cleanPath.startsWith(r)
    );
    if (parentRoute) {
      return hasPermission(admin, ROUTE_PERMISSIONS[parentRoute]);
    }
    return true;
  }

  return hasPermission(admin, requiredPermission);
}

/**
 * Lấy danh xưng chức vụ hiển thị
 */
export function getPositionBadgeInfo(position?: string, role?: string) {
  const pos = (position || '').toLowerCase();

  if (role === 'admin' || pos === 'manager') {
    return {
      title: 'Tổng Quản Lý Boutique',
      shortTitle: 'Manager',
      badgeColor: 'border-[#d4af37]/40 bg-[#d4af37]/15 text-[#d4af37]',
      tagColor: 'text-[#d4af37]',
      canApprove: true,
      canManageStaff: true,
      canAccessCashRegister: true,
    };
  }

  if (pos === 'sales') {
    return {
      title: 'Tư Vấn & Thu Ngân Trực Ca',
      shortTitle: 'Sales & Thu Ngân',
      badgeColor: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400',
      tagColor: 'text-emerald-400',
      canApprove: false,
      canManageStaff: false,
      canAccessCashRegister: true,
    };
  }

  if (pos === 'warehouse') {
    return {
      title: 'Quản Lý Kho & Số Serial',
      shortTitle: 'Thủ Kho',
      badgeColor: 'border-amber-500/40 bg-amber-500/15 text-amber-400',
      tagColor: 'text-amber-400',
      canApprove: false,
      canManageStaff: false,
      canAccessCashRegister: false,
    };
  }

  if (pos === 'technician') {
    return {
      title: 'Kỹ Thuật Viên Trưởng',
      shortTitle: 'Kỹ Thuật Viên',
      badgeColor: 'border-sky-500/40 bg-sky-500/15 text-sky-400',
      tagColor: 'text-sky-400',
      canApprove: false,
      canManageStaff: false,
      canAccessCashRegister: false,
    };
  }

  return {
    title: 'Nhân Viên Nội Bộ',
    shortTitle: 'Staff',
    badgeColor: 'border-white/20 bg-white/10 text-stone-300',
    tagColor: 'text-stone-300',
    canApprove: false,
    canManageStaff: false,
    canAccessCashRegister: false,
  };
}
