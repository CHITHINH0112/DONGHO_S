import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import ghnService from '../services/ghn.service.js';

export const getProvinces = asyncHandler(async (req, res) => {
  const provinces = await ghnService.getProvinces();
  return successResponse(res, {
    message: 'Lấy danh sách Tỉnh / Thành phố từ Giao Hàng Nhanh (GHN) thành công',
    data: provinces,
  });
});

export const getDistricts = asyncHandler(async (req, res) => {
  const { province_id } = req.query;
  const districts = await ghnService.getDistricts(province_id);
  return successResponse(res, {
    message: 'Lấy danh sách Quận / Huyện từ Giao Hàng Nhanh (GHN) thành công',
    data: districts,
  });
});

export const getWards = asyncHandler(async (req, res) => {
  const { district_id } = req.query;
  const wards = await ghnService.getWards(district_id);
  return successResponse(res, {
    message: 'Lấy danh sách Phường / Xã từ Giao Hàng Nhanh (GHN) thành công',
    data: wards,
  });
});

export const calculateShippingFee = asyncHandler(async (req, res) => {
  const { province, district, address, weight, value, toDistrictId, toWardCode } = req.body;

  const feeData = await ghnService.calculateShippingFee({
    province: province || '',
    district: district || '',
    address: address || '',
    weight,
    value,
    toDistrictId,
    toWardCode,
  });

  return successResponse(res, {
    message: 'Tính phí vận chuyển Giao Hàng Nhanh (GHN) thành công',
    data: feeData,
  });
});

export const getTrackingTimeline = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { orderStatus } = req.query;

  const trackingData = await ghnService.getTrackingTimeline(code, orderStatus);

  return successResponse(res, {
    message: 'Lấy thông tin hành trình Giao Hàng Nhanh (GHN) thành công',
    data: trackingData,
  });
});

// Admin Controllers
export const getShipments = asyncHandler(async (req, res) => {
  const result = await ghnService.getAdminShipments(req.query);
  return successResponse(res, {
    message: 'Lấy danh sách vận đơn GHN Express thành công',
    data: result.shipments,
    meta: {
      stats: result.stats,
      pagination: result.pagination,
    },
  });
});

export const updateShipmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await ghnService.updateShipmentStatus(id, status);
  return successResponse(res, {
    message: 'Cập nhật trạng thái vận đơn GHN thành công',
    data: updated,
  });
});

export const syncShipmentGHN = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const synced = await ghnService.syncShipmentGHN(id);
  return successResponse(res, {
    message: synced.message,
    data: synced.shipment,
  });
});

export default {
  getProvinces,
  getDistricts,
  getWards,
  calculateShippingFee,
  getTrackingTimeline,
  getShipments,
  updateShipmentStatus,
  syncShipmentGHN,
};
