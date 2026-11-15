import { Op } from 'sequelize';
import * as XLSX from 'xlsx';
import {
  sequelize,
  SerialNumber,
  ProductVariant,
  Product,
  Admin,
} from '../models/index.js';

/**
 * Tạo file mẫu Excel nhập kho (Tự động điền danh sách SKU thực tế trong CSDL)
 */
export const generateSerialTemplateBuffer = async () => {
  const variants = await ProductVariant.findAll({
    include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
    order: [['id', 'ASC']],
  });

  const sampleData =
    variants.length > 0
      ? variants.map((v, idx) => ({
          'Mã SKU (*)': v.sku,
          'Số Serial (*)': `SN-${v.sku}-${1001 + idx}`,
          'Tình trạng (new/like_new/pre_owned)': 'new',
          'Vị trí (warehouse/showroom)': 'warehouse',
          'Ghi chú': `Lô nhập cho mẫu ${v.product?.name || 'Đồng hồ'}`,
        }))
      : [
          {
            'Mã SKU (*)': 'CAS-5-730',
            'Số Serial (*)': 'SN-CAS-2026-0001',
            'Tình trạng (new/like_new/pre_owned)': 'new',
            'Vị trí (warehouse/showroom)': 'warehouse',
            'Ghi chú': 'Lô hàng xuất xưởng tháng 11/2026',
          },
        ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  // Cài đặt độ rộng cột cho đẹp mắt
  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 25 },
    { wch: 35 },
    { wch: 28 },
    { wch: 45 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachSerial');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Xử lý file Excel do Admin tải lên -> Tạo Serial trạng thái 'pending_warehouse_check'
 */
export const importSerialsFromExcel = async (fileBuffer, adminId) => {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('File Excel rỗng, không tìm thấy Sheet dữ liệu.');
  }

  const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    throw new Error('Không có dòng dữ liệu nào trong file Excel.');
  }

  // Chuẩn hóa tên cột linh hoạt
  const normalizedRows = rawRows.map((row, idx) => {
    const sku = (
      row['Mã SKU (*)'] ||
      row['Mã SKU'] ||
      row['SKU'] ||
      row['sku'] ||
      row['ma_sku'] ||
      ''
    ).toString().trim();

    const serialNumber = (
      row['Số Serial (*)'] ||
      row['Số Serial'] ||
      row['Serial Number'] ||
      row['Serial'] ||
      row['serial'] ||
      row['serial_number'] ||
      ''
    ).toString().trim();

    let condition = (
      row['Tình trạng (new/like_new/pre_owned)'] ||
      row['Tình trạng'] ||
      row['item_condition'] ||
      row['Condition'] ||
      'new'
    ).toString().trim().toLowerCase();
    if (!['new', 'like_new', 'pre_owned'].includes(condition)) {
      condition = 'new';
    }

    let location = (
      row['Vị trí (warehouse/showroom)'] ||
      row['Vị trí'] ||
      row['location'] ||
      row['Location'] ||
      'warehouse'
    ).toString().trim().toLowerCase();
    if (!['warehouse', 'showroom'].includes(location)) {
      location = 'warehouse';
    }

    const note = (
      row['Ghi chú'] ||
      row['note'] ||
      row['Note'] ||
      ''
    ).toString().trim();

    return {
      rowIndex: idx + 2, // Dòng trong Excel (bắt đầu từ dòng 2 do dòng 1 là header)
      sku,
      serialNumber,
      itemCondition: condition,
      location,
      note,
    };
  });

  // Lấy danh sách SKU phân biệt và truy vấn database
  const distinctSkus = Array.from(new Set(normalizedRows.map((r) => r.sku).filter(Boolean)));
  const variants = await ProductVariant.findAll({
    where: { sku: distinctSkus },
    include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
  });

  const variantMap = new Map();
  variants.forEach((v) => {
    variantMap.set(v.sku.toUpperCase(), v);
  });

  // Kiểm tra trùng lặp serial trong chính file Excel
  const serialCountMap = new Map();
  normalizedRows.forEach((r) => {
    if (r.serialNumber) {
      const key = r.serialNumber.toUpperCase();
      serialCountMap.set(key, (serialCountMap.get(key) || 0) + 1);
    }
  });

  // Kiểm tra serial đã tồn tại trong database
  const distinctSerials = Array.from(new Set(normalizedRows.map((r) => r.serialNumber).filter(Boolean)));
  const existingDbSerials = await SerialNumber.findAll({
    where: { serialNumber: distinctSerials },
    attributes: ['serialNumber'],
  });
  const existingDbSerialSet = new Set(existingDbSerials.map((s) => s.serialNumber.toUpperCase()));

  const successList = [];
  const errors = [];

  for (const item of normalizedRows) {
    if (!item.sku) {
      errors.push({ line: item.rowIndex, error: 'Thiếu mã SKU của sản phẩm' });
      continue;
    }
    if (!item.serialNumber) {
      errors.push({ line: item.rowIndex, error: `SKU ${item.sku}: Thiếu số Serial` });
      continue;
    }

    const variant = variantMap.get(item.sku.toUpperCase());
    if (!variant) {
      errors.push({ line: item.rowIndex, error: `Mã SKU '${item.sku}' không tồn tại trong hệ thống` });
      continue;
    }

    if (serialCountMap.get(item.serialNumber.toUpperCase()) > 1) {
      errors.push({ line: item.rowIndex, error: `Số Serial '${item.serialNumber}' bị trùng lặp nhiều lần trong file Excel` });
      continue;
    }

    if (existingDbSerialSet.has(item.serialNumber.toUpperCase())) {
      errors.push({ line: item.rowIndex, error: `Số Serial '${item.serialNumber}' đã tồn tại trong CSDL` });
      continue;
    }

    successList.push({
      variantId: variant.id,
      serialNumber: item.serialNumber,
      status: 'pending_warehouse_check', // Chờ kho kiểm tra thực tế
      itemCondition: item.itemCondition,
      location: item.location,
      importedByAdminId: adminId,
      adminApprovedAt: new Date(),
      note: item.note || `Nhập kho Excel ngày ${new Date().toLocaleDateString('vi-VN')}`,
    });
  }

  // Nếu có serial hợp lệ, insert hàng loạt vào DB
  let createdCount = 0;
  if (successList.length > 0) {
    await SerialNumber.bulkCreate(successList);
    createdCount = successList.length;
  }

  return {
    totalRows: normalizedRows.length,
    successCount: createdCount,
    failedCount: errors.length,
    errors,
  };
};

/**
 * Lấy danh sách Serial Numbers (có filter & phân trang)
 */
export const getSerialNumbers = async (query = {}) => {
  const {
    status,
    variantId,
    productId,
    search,
    page = 1,
    limit = 50,
  } = query;

  const where = {};
  if (status && status !== 'all') {
    where.status = status;
  }
  if (variantId) {
    where.variantId = variantId;
  }
  if (search) {
    where.serialNumber = { [Op.like]: `%${search.trim()}%` };
  }

  const variantWhere = {};
  if (productId) {
    variantWhere.productId = productId;
  }

  const [countResult, statusCounts] = await Promise.all([
    SerialNumber.findAndCountAll({
      where,
      include: [
        {
          model: ProductVariant,
          as: 'variant',
          where: Object.keys(variantWhere).length > 0 ? variantWhere : undefined,
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'imageUrl', 'chatLieuDayDeo'],
            },
          ],
        },
        {
          model: Admin,
          as: 'importedBy',
          attributes: ['id', 'name', 'staffCode', 'email'],
        },
        {
          model: Admin,
          as: 'warehouseStaff',
          attributes: ['id', 'name', 'staffCode', 'email'],
        },
      ],
      order: [['id', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    }),
    SerialNumber.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      ],
      group: ['status'],
      raw: true,
    }),
  ]);

  const { rows, count } = countResult;

  const stats = {
    pending: 0,
    available: 0,
    defective: 0,
    missing: 0,
    total: 0,
  };
  statusCounts.forEach((sc) => {
    const totalNum = Number(sc.total) || 0;
    stats.total += totalNum;
    if (sc.status === 'pending_warehouse_check') stats.pending += totalNum;
    if (sc.status === 'available') stats.available += totalNum;
    if (sc.status === 'defective') stats.defective += totalNum;
    if (sc.status === 'missing_on_import') stats.missing += totalNum;
  });

  return {
    serials: rows,
    stats,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};

/**
 * Lấy danh sách hàng chờ nhân viên kho kiểm tra (nhóm theo biến thể)
 */
export const getPendingWarehouseChecks = async () => {
  const pendingSerials = await SerialNumber.findAll({
    where: { status: 'pending_warehouse_check' },
    include: [
      {
        model: ProductVariant,
        as: 'variant',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'imageUrl'],
          },
        ],
      },
      {
        model: Admin,
        as: 'importedBy',
        attributes: ['id', 'name', 'staffCode'],
      },
    ],
    order: [['adminApprovedAt', 'DESC'], ['id', 'ASC']],
  });

  return pendingSerials;
};

/**
 * Nhân viên kho xác nhận kiểm tra tình trạng lô hàng -> Chuyển sang 'available'
 */
export const confirmWarehouseSerials = async (serialIds, warehouseStaffId) => {
  if (!Array.isArray(serialIds) || serialIds.length === 0) {
    throw new Error('Vui lòng chọn ít nhất 1 số Serial để xác nhận nhập kho.');
  }

  const [updatedCount] = await SerialNumber.update(
    {
      status: 'available',
      warehouseConfirmedById: warehouseStaffId,
      warehouseConfirmedAt: new Date(),
    },
    {
      where: {
        id: serialIds,
        status: 'pending_warehouse_check',
      },
    }
  );

  return {
    confirmedCount: updatedCount,
  };
};

/**
 * Nhân viên kho báo cáo phát hiện sai lệch lô hàng (thiếu hàng / hỏng hóc)
 */
export const reportSerialDiscrepancy = async (serialId, status, note, warehouseStaffId) => {
  if (!['missing_on_import', 'defective'].includes(status)) {
    throw new Error("Trạng thái sai lệch không hợp lệ (chỉ chấp nhận 'missing_on_import' hoặc 'defective').");
  }

  const serial = await SerialNumber.findByPk(serialId);
  if (!serial) {
    throw new Error(`Không tìm thấy số Serial ID '${serialId}'.`);
  }

  await serial.update({
    status,
    note: note ? `[Kho báo cáo] ${note}` : `[Kho báo cáo] Hàng phát hiện trạng thái: ${status}`,
    warehouseConfirmedById: warehouseStaffId,
    warehouseConfirmedAt: new Date(),
  });

  return serial;
};

/**
 * Lấy danh sách các cảnh báo sự cố kho mới nhất (hàng lỗi / thiếu) cho Admin
 */
export const getSerialDiscrepancyAlerts = async () => {
  const alerts = await SerialNumber.findAll({
    where: {
      status: ['defective', 'missing_on_import'],
    },
    include: [
      {
        model: ProductVariant,
        as: 'variant',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'imageUrl'],
          },
        ],
      },
      {
        model: Admin,
        as: 'warehouseStaff',
        attributes: ['id', 'name', 'staffCode', 'email'],
      },
    ],
    order: [['warehouseConfirmedAt', 'DESC'], ['id', 'DESC']],
    limit: 20,
  });

  return alerts;
};


