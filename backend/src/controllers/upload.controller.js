import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const handleUploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Vui lòng đính kèm tệp hình ảnh hợp lệ (dưới 5MB).',
    });
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const relativePath = `/uploads/products/${req.file.filename}`;
  const fullUrl = `${baseUrl}${relativePath}`;

  return successResponse(res, {
    statusCode: 201,
    message: 'Tải lên hình ảnh thành công',
    data: {
      url: fullUrl,
      relativePath,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

export const handleUploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Vui lòng đính kèm ít nhất một tệp hình ảnh hợp lệ.',
    });
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const filesData = req.files.map((file) => {
    const relativePath = `/uploads/products/${file.filename}`;
    const fullUrl = `${baseUrl}${relativePath}`;
    return {
      url: fullUrl,
      relativePath,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  });

  return successResponse(res, {
    statusCode: 201,
    message: `Đã tải lên thành công ${filesData.length} hình ảnh`,
    data: filesData,
  });
});

export default {
  handleUploadImage,
  handleUploadMultipleImages,
};

