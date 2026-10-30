import { Op } from 'sequelize';
import {
  Product,
  Brand,
  Category,
  ProductVariant,
  ProductVariantImage,
  SerialNumber,
  Feature,
} from '../models/index.js';

export const getAllProducts = async (query = {}) => {
  const {
    brandId,
    categoryId,
    gender,
    loaiBoMay,
    priceMin,
    priceMax,
    search,
    status = 'active',
    page = 1,
    limit = 20,
    sortBy = 'id',
    order = 'DESC',
  } = query;

  const where = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  if (brandId) {
    where.brandId = brandId;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (gender) {
    where.gender = gender;
  }

  if (loaiBoMay) {
    where.loaiBoMay = loaiBoMay;
  }

  if (priceMin || priceMax) {
    where.basePrice = {};
    if (priceMin) where.basePrice[Op.gte] = Number(priceMin);
    if (priceMax) where.basePrice[Op.lte] = Number(priceMax);
  }

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { slug: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (Number(page) - 1) * Number(limit);

  const { count, rows } = await Product.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [[sortBy, order.toUpperCase()]],
    distinct: true,
    include: [
      {
        model: Brand,
        as: 'brand',
        attributes: ['id', 'name', 'slug', 'country'],
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: ProductVariant,
        as: 'variants',
        attributes: ['id', 'sku', 'price', 'costPrice', 'status', 'mauMatSo'],
        include: [
          {
            model: ProductVariantImage,
            as: 'images',
          },
        ],
      },
      {
        model: Feature,
        as: 'features',
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] },
      },
    ],
  });

  return {
    products: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};

export const getProductByIdOrSlug = async (identifier) => {
  const isNumber = !isNaN(identifier);
  const where = isNumber ? { id: Number(identifier) } : { slug: identifier };

  const product = await Product.findOne({
    where,
    include: [
      {
        model: Brand,
        as: 'brand',
      },
      {
        model: Category,
        as: 'category',
      },
      {
        model: ProductVariant,
        as: 'variants',
        include: [
          {
            model: ProductVariantImage,
            as: 'images',
          },
          {
            model: SerialNumber,
            as: 'serialNumbers',
            attributes: ['id', 'serialNumber', 'status', 'itemCondition', 'location'],
          },
        ],
      },
      {
        model: Feature,
        as: 'features',
        through: { attributes: [] },
      },
    ],
  });

  return product;
};

export const createProduct = async (data) => {
  const { featureIds, ...productData } = data;
  const product = await Product.create(productData);

  if (Array.isArray(featureIds) && featureIds.length > 0) {
    await product.setFeatures(featureIds);
  }

  return await getProductByIdOrSlug(product.id);
};

export const updateProduct = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) return null;

  const { featureIds, ...productData } = data;
  await product.update(productData);

  if (Array.isArray(featureIds)) {
    await product.setFeatures(featureIds);
  }

  return await getProductByIdOrSlug(id);
};

export const deleteProduct = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) return null;
  await product.destroy();
  return true;
};

// Quản lý biến thể (Variants)
export const addVariant = async (productId, data) => {
  const { images, ...variantData } = data;
  const variant = await ProductVariant.create({ ...variantData, productId });

  if (Array.isArray(images) && images.length > 0) {
    const imageRecords = images.map((img, idx) => ({
      variantId: variant.id,
      imageUrl: typeof img === 'string' ? img : img.imageUrl,
      isDefault: idx === 0,
      sortOrder: idx,
    }));
    await ProductVariantImage.bulkCreate(imageRecords);
  }

  return await ProductVariant.findByPk(variant.id, {
    include: [{ model: ProductVariantImage, as: 'images' }],
  });
};

export const updateVariant = async (variantId, data) => {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) return null;

  const { images, ...variantData } = data;
  await variant.update(variantData);

  if (Array.isArray(images)) {
    await ProductVariantImage.destroy({ where: { variantId } });
    if (images.length > 0) {
      const imageRecords = images.map((img, idx) => ({
        variantId,
        imageUrl: typeof img === 'string' ? img : img.imageUrl,
        isDefault: idx === 0,
        sortOrder: idx,
      }));
      await ProductVariantImage.bulkCreate(imageRecords);
    }
  }

  return await ProductVariant.findByPk(variant.id, {
    include: [{ model: ProductVariantImage, as: 'images' }],
  });
};

export const deleteVariant = async (variantId) => {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) return null;
  await variant.destroy();
  return true;
};

export default {
  getAllProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
};
