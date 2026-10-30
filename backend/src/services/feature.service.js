import { Feature, Product, ProductFeature } from '../models/index.js';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

export const getAllFeatures = async () => {
  return await Feature.findAll({
    include: [
      {
        model: Product,
        as: 'products',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
    ],
    order: [['name', 'ASC']],
  });
};

export const getFeatureByIdOrSlug = async (identifier) => {
  const isNumber = !isNaN(identifier);
  const where = isNumber ? { id: Number(identifier) } : { slug: identifier };

  return await Feature.findOne({
    where,
    include: [
      {
        model: Product,
        as: 'products',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
    ],
  });
};

export const createFeature = async (data) => {
  let { name, slug } = data;
  if (!slug || slug.trim() === '') {
    slug = slugify(name);
  } else {
    slug = slugify(slug);
  }
  return await Feature.create({ name, slug });
};

export const updateFeature = async (id, data) => {
  const feature = await Feature.findByPk(id);
  if (!feature) return null;

  let { name, slug } = data;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined && slug.trim() !== '') {
    updateData.slug = slugify(slug);
  } else if (name !== undefined) {
    updateData.slug = slugify(name);
  }

  await feature.update(updateData);
  return feature;
};

export const deleteFeature = async (id) => {
  const feature = await Feature.findByPk(id);
  if (!feature) return null;

  await ProductFeature.destroy({ where: { featureId: id } });
  await feature.destroy();
  return true;
};

export default {
  getAllFeatures,
  getFeatureByIdOrSlug,
  createFeature,
  updateFeature,
  deleteFeature,
};

