import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import productService from '../services/product.service.js';

export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  return successResponse(res, {
    message: 'Lấy danh sách sản phẩm thành công',
    data: result.products,
    meta: result.pagination,
  });
});

export const getProductDetail = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const product = await productService.getProductByIdOrSlug(idOrSlug);

  if (!product) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy sản phẩm '${idOrSlug}'`,
    });
  }

  return successResponse(res, {
    message: 'Lấy chi tiết sản phẩm thành công',
    data: product,
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: 'Thêm mới sản phẩm thành công',
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedProduct = await productService.updateProduct(id, req.body);

  if (!updatedProduct) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy sản phẩm ID '${id}' để cập nhật`,
    });
  }

  return successResponse(res, {
    message: 'Cập nhật thông tin sản phẩm thành công',
    data: updatedProduct,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await productService.deleteProduct(id);

  if (!success) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy sản phẩm ID '${id}' để xóa`,
    });
  }

  return successResponse(res, {
    message: 'Xóa sản phẩm thành công',
  });
});

export const addProductVariant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const variant = await productService.addVariant(id, req.body);

  return successResponse(res, {
    statusCode: 201,
    message: 'Thêm mới biến thể sản phẩm thành công',
    data: variant,
  });
});

export const updateProductVariant = asyncHandler(async (req, res) => {
  const variantId = req.params.variantId || req.params.id;
  const updatedVariant = await productService.updateVariant(variantId, req.body);

  if (!updatedVariant) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy biến thể ID '${variantId}' để cập nhật`,
    });
  }

  return successResponse(res, {
    message: 'Cập nhật biến thể sản phẩm thành công',
    data: updatedVariant,
  });
});

export const deleteProductVariant = asyncHandler(async (req, res) => {
  const variantId = req.params.variantId || req.params.id;
  const success = await productService.deleteVariant(variantId);

  if (!success) {
    return errorResponse(res, {
      statusCode: 404,
      message: `Không tìm thấy biến thể ID '${variantId}' để xóa`,
    });
  }

  return successResponse(res, {
    message: 'Xóa biến thể sản phẩm thành công',
  });
});

export default {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
};
