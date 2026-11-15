import { Op } from 'sequelize';
import {
  Product,
  Brand,
  Category,
  ProductVariant,
  ProductVariantImage,
  SerialNumber,
} from '../models/index.js';

export const getAllWatches = async (query = {}) => {
  const {
    category,
    brand,
    search,
    gender,
    page = 1,
    limit = 20,
    sort = 'id',
    order = 'DESC',
  } = query;

  const where = {};

  if (category && category !== 'all') {
    where.categoryId = category;
  }

  if (brand) {
    where.brandId = brand;
  }

  if (gender) {
    where.gender = gender;
  }

  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }

  const offset = (Number(page) - 1) * Number(limit);

  const { count, rows } = await Product.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [[sort, order.toUpperCase()]],
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
        include: [
          {
            model: ProductVariantImage,
            as: 'images',
          },
          {
            model: SerialNumber,
            as: 'serialNumbers',
            attributes: ['id', 'serialNumber', 'status'],
          },
        ],
      },
    ],
  });

  return {
    watches: rows,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / Number(limit)),
      currentPage: Number(page),
      limit: Number(limit),
    },
  };
};

export const getWatchById = async (id) => {
  const product = await Product.findByPk(id, {
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
    ],
  });
  return product;
};

export const createWatch = async (data) => {
  const newProduct = await Product.create(data);
  return newProduct;
};

export const updateWatch = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) return null;

  await product.update(data);
  return product;
};

export const deleteWatch = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) return null;

  await product.destroy();
  return true;
};

export default {
  getAllWatches,
  getWatchById,
  createWatch,
  updateWatch,
  deleteWatch,
};
