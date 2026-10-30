import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import featureService from '../services/feature.service.js';

export const getFeatures = asyncHandler(async (req, res) => {
  const features = await featureService.getAllFeatures();
  return successResponse(res, {
    message: 'Lấy danh sách tính năng sản phẩm thành công',
    data: features,
  });
});

export const getFeatureDetail = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const feature = await featureService.getFeatureByIdOrSlug(idOrSlug);

  if (!feature) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy tính năng '${idOrSlug}'`,
    });
  }

  return successResponse(res, {
    message: 'Lấy chi tiết tính năng thành công',
    data: feature,
  });
});

export const createFeature = asyncHandler(async (req, res) => {
  const feature = await featureService.createFeature(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'Thêm mới tính năng thành công',
    data: feature,
  });
});

export const updateFeature = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedFeature = await featureService.updateFeature(id, req.body);

  if (!updatedFeature) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy tính năng ID '${id}' để cập nhật`,
    });
  }

  return successResponse(res, {
    message: 'Cập nhật tính năng thành công',
    data: updatedFeature,
  });
});

export const deleteFeature = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await featureService.deleteFeature(id);

  if (!success) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy tính năng ID '${id}' để xóa`,
    });
  }

  return successResponse(res, {
    message: 'Xóa tính năng thành công',
  });
});

export default {
  getFeatures,
  getFeatureDetail,
  createFeature,
  updateFeature,
  deleteFeature,
};

