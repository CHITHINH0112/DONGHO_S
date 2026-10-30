'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faPlus,
  faMagnifyingGlass,
  faFilter,
  faBoxesStacked,
  faShieldHalved,
  faPenToSquare,
  faTrashCan,
  faXmark,
  faTag,
  faPalette,
  faLayerGroup,
  faCheck,
  faSpinner,
  faChevronDown,
  faChevronUp,
  faGem,
  faWrench,
  faCoins,
  faCircleCheck,
  faTriangleExclamation,
  faCloudArrowUp,
  faImage,
  faStar,
  faSliders,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { hasPermission } from '@/utils/permissions';
import apiClient from '@/lib/axios';

interface VariantImage {
  id?: number;
  variantId?: number;
  imageUrl: string;
  isDefault?: boolean;
  sortOrder?: number;
}

interface Variant {
  id: number;
  productId: number;
  sku: string;
  price: string | number;
  costPrice?: string | number | null;
  status: 'active' | 'hidden';
  mauMatSo?: string | null;
  images?: VariantImage[];
}

interface Feature {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  brandId?: number | null;
  categoryId?: number | null;
  basePrice: string | number;
  description?: string | null;
  gender: 'male' | 'female' | 'unisex';
  loaiBoMay?: 'quartz' | 'automatic' | 'manual' | 'solar' | 'smart' | null;
  chatLieuKinh?: string | null;
  duongKinhMatSo?: string | number | null;
  beDayMatSo?: string | number | null;
  chatLieuNieng?: string | null;
  chatLieuDayDeo?: string | null;
  khaNangChongNuoc?: string | null;
  trackSerial: boolean;
  warrantyMonths: number;
  status: 'active' | 'hidden' | 'discontinued';
  imageUrl?: string | null;
  brand?: { id: number; name: string; slug: string; country?: string };
  category?: { id: number; name: string; slug: string };
  variants?: Variant[];
  features?: Feature[];
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  country?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const { admin } = useAdminAuth();
  const canManageProducts = hasPermission(admin, 'PRODUCTS_MANAGE');

  // Dữ liệu từ API
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Bộ lọc & Tìm kiếm
  const [search, setSearch] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [expandedProductId, setExpandedProductId] = useState<number | null>(null);

  // Modal Thêm / Sửa Sản Phẩm Mới
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Trạng thái Upload ảnh từ máy tính
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const initialProductForm = {
    name: '',
    slug: '',
    brandId: '',
    categoryId: '',
    basePrice: '',
    gender: 'unisex' as 'male' | 'female' | 'unisex',
    loaiBoMay: 'automatic' as 'quartz' | 'automatic' | 'manual' | 'solar' | 'smart',
    chatLieuKinh: 'Kính Sapphire chống phản chiếu',
    duongKinhMatSo: '40.0',
    beDayMatSo: '10.5',
    chatLieuNieng: 'Thép không gỉ 316L',
    chatLieuDayDeo: 'Dây Thép Không Gỉ 316L',
    khaNangChongNuoc: '10 ATM (100m)',
    warrantyMonths: 24,
    description: '',
    imageUrl: '',
    status: 'active' as 'active' | 'hidden' | 'discontinued',
    featureIds: [] as number[],
  };

  const [productForm, setProductForm] = useState(initialProductForm);

  // Modal Thêm / Sửa Biến Thể
  const [showVariantModal, setShowVariantModal] = useState<boolean>(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<{ product: Product; variant: Variant } | null>(null);

  // Danh sách các tag gợi ý màu sắc mặt số chuẩn BRU_WATCH
  const SUGGESTED_DIAL_COLORS = [
    { label: 'Đen Sunray', color: '#1a1a1a' },
    { label: 'Xanh Ice Blue', color: '#7dd3fc' },
    { label: 'Xanh Hải Quân (Navy)', color: '#1e3a8a' },
    { label: 'Trắng Bạc (Silver)', color: '#e2e8f0' },
    { label: 'Xanh Lá Emerald', color: '#10b981' },
    { label: 'Vàng Champagne', color: '#fde047' },
    { label: 'Đỏ Rượu (Burgundy)', color: '#991b1b' },
    { label: 'Xà Cừ (Mother of Pearl)', color: '#cbd5e1' },
    { label: 'Mặt Lộ Cơ (Skeleton)', color: '#d4af37' },
    { label: 'Xám Anthracite', color: '#475569' },
    { label: 'Hồng Salmon', color: '#fb7185' },
    { label: 'Nâu Chocolate', color: '#78350f' },
  ];

  // Danh sách các tag gợi ý chất liệu dây đeo
  const SUGGESTED_STRAPS = [
    'Dây Thép Không Gỉ 316L',
    'Dây Da Cá Sấu (Alligator)',
    'Dây Da Bò Cao Cấp',
    'Dây Cao Su FKM Chống Nước',
    'Dây Kim Loại Demi Vàng 18K',
    'Dây Titan Hàng Không',
    'Dây Vải NATO Quân Đội',
  ];

  // Trạng thái ảnh biến thể
  const [variantImages, setVariantImages] = useState<string[]>([]);
  const [uploadingVariantImages, setUploadingVariantImages] = useState<boolean>(false);
  const variantFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [variantForm, setVariantForm] = useState({
    sku: '',
    price: '',
    costPrice: '',
    mauMatSo: 'Đen Sunray',
    status: 'active' as 'active' | 'hidden',
  });

  // Tải danh sách sản phẩm, brands, categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProducts, resBrands, resCats, resFeats] = await Promise.allSettled([
        apiClient.get('/products?limit=100&status=all'),
        apiClient.get('/brands'),
        apiClient.get('/categories'),
        apiClient.get('/features'),
      ]);

      if (resProducts.status === 'fulfilled') {
        const prodData = resProducts.value.data?.data;
        if (Array.isArray(prodData)) {
          setProducts(prodData);
        }
      }

      if (resBrands.status === 'fulfilled') {
        const brandData = resBrands.value.data?.data;
        if (Array.isArray(brandData)) {
          setBrands(brandData);
        }
      }

      if (resCats.status === 'fulfilled') {
        const catData = resCats.value.data?.data;
        if (Array.isArray(catData)) {
          setCategories(catData);
        }
      }

      if (resFeats.status === 'fulfilled') {
        const featData = resFeats.value.data?.data;
        if (Array.isArray(featData)) {
          setFeatures(featData);
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu sản phẩm:', err);
      showToast('error', 'Chưa thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra kết nối API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Tự động tạo slug khi gõ tên sản phẩm
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    setProductForm((prev) => ({
      ...prev,
      name: val,
      slug: generatedSlug,
    }));
  };

  // Xử lý upload ảnh trực tiếp từ máy tính
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Kiểm tra định dạng
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast('error', 'Chỉ chấp nhận các tệp ảnh định dạng JPG, PNG, WEBP, GIF.');
      return;
    }

    // Kiểm tra dung lượng (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Dung lượng ảnh tối đa là 5MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    // Hiển thị preview ngay lập tức
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success && res.data.data?.url) {
        const uploadedUrl = res.data.data.url;
        setProductForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
        showToast('success', 'Đã tải lên ảnh sản phẩm thành công!');
      } else {
        showToast('error', 'Không nhận được đường dẫn ảnh sau khi tải lên.');
      }
    } catch (err: any) {
      console.error('Lỗi khi tải ảnh lên:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi tải ảnh lên máy chủ';
      showToast('error', msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setProductForm((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Mở modal tạo sản phẩm mới
  const openCreateProductModal = () => {
    setEditingProduct(null);
    setProductForm(initialProductForm);
    setImagePreview(null);
    setShowProductModal(true);
  };

  // Mở modal sửa sản phẩm
  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setImagePreview(product.imageUrl || null);
    setProductForm({
      name: product.name || '',
      slug: product.slug || '',
      brandId: product.brandId ? String(product.brandId) : '',
      categoryId: product.categoryId ? String(product.categoryId) : '',
      basePrice: product.basePrice ? String(product.basePrice) : '',
      gender: product.gender || 'unisex',
      loaiBoMay: (product.loaiBoMay as any) || 'automatic',
      chatLieuKinh: product.chatLieuKinh || '',
      duongKinhMatSo: product.duongKinhMatSo ? String(product.duongKinhMatSo) : '',
      beDayMatSo: product.beDayMatSo ? String(product.beDayMatSo) : '',
      chatLieuNieng: product.chatLieuNieng || '',
      chatLieuDayDeo: product.chatLieuDayDeo || 'Dây Thép Không Gỉ 316L',
      khaNangChongNuoc: product.khaNangChongNuoc || '',
      warrantyMonths: product.warrantyMonths || 24,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      status: product.status || 'active',
      featureIds: (product.features || []).map((f) => f.id),
    });
    setShowProductModal(true);
  };

  // Xử lý lưu sản phẩm (Thêm mới hoặc Cập nhật)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      showToast('error', 'Vui lòng nhập tên mẫu đồng hồ.');
      return;
    }
    if (!productForm.basePrice || Number(productForm.basePrice) <= 0) {
      showToast('error', 'Vui lòng nhập giá niêm yết hợp lệ.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: productForm.name.trim(),
        slug: productForm.slug.trim() || `watch-${Date.now()}`,
        brandId: productForm.brandId ? Number(productForm.brandId) : null,
        categoryId: productForm.categoryId ? Number(productForm.categoryId) : null,
        basePrice: Number(productForm.basePrice),
        gender: productForm.gender,
        loaiBoMay: productForm.loaiBoMay,
        chatLieuKinh: productForm.chatLieuKinh || null,
        duongKinhMatSo: productForm.duongKinhMatSo ? Number(productForm.duongKinhMatSo) : null,
        beDayMatSo: productForm.beDayMatSo ? Number(productForm.beDayMatSo) : null,
        chatLieuNieng: productForm.chatLieuNieng || null,
        chatLieuDayDeo: productForm.chatLieuDayDeo || null,
        khaNangChongNuoc: productForm.khaNangChongNuoc || null,
        warrantyMonths: Number(productForm.warrantyMonths) || 24,
        description: productForm.description || null,
        imageUrl: productForm.imageUrl || null,
        status: productForm.status,
        featureIds: productForm.featureIds,
      };

      if (editingProduct) {
        const res = await apiClient.put(`/products/${editingProduct.id}`, payload);
        if (res.data?.success) {
          showToast('success', `Đã cập nhật thành công mẫu: ${payload.name}`);
        }
      } else {
        const res = await apiClient.post('/products', payload);
        if (res.data?.success) {
          showToast('success', `Đã thêm thành công mẫu đồng hồ: ${payload.name}`);
        }
      }

      setShowProductModal(false);
      setEditingProduct(null);
      setImagePreview(null);
      setProductForm(initialProductForm);
      await fetchData();
    } catch (err: any) {
      console.error('Lỗi lưu sản phẩm:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể lưu thông tin sản phẩm';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xác nhận xóa sản phẩm
  const handleConfirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      setSubmitting(true);
      const res = await apiClient.delete(`/products/${deletingProduct.id}`);
      if (res.data?.success) {
        showToast('success', `Đã xóa thành công mẫu đồng hồ: ${deletingProduct.name}`);
        setDeletingProduct(null);
        await fetchData();
      }
    } catch (err: any) {
      console.error('Lỗi xóa sản phẩm:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể xóa mẫu đồng hồ';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal thêm biến thể cho một sản phẩm cụ thể
  const openAddVariantModal = (product: Product) => {
    setTargetProduct(product);
    setEditingVariant(null);
    setVariantImages([]);
    const brandPrefix = product.brand?.name?.substring(0, 3)?.toUpperCase() || 'WT';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setVariantForm({
      sku: `${brandPrefix}-${product.id}-${randomSuffix}`,
      price: product.basePrice ? String(product.basePrice) : '',
      costPrice: product.basePrice ? String(Math.round(Number(product.basePrice) * 0.75)) : '',
      mauMatSo: 'Đen Sunray',
      status: 'active',
    });
    setShowVariantModal(true);
  };

  // Mở modal sửa biến thể
  const openEditVariantModal = (product: Product, variant: Variant) => {
    setTargetProduct(product);
    setEditingVariant(variant);
    const existingImages = (variant.images || []).map((img) => img.imageUrl);
    setVariantImages(existingImages);
    setVariantForm({
      sku: variant.sku,
      price: String(variant.price),
      costPrice: variant.costPrice ? String(variant.costPrice) : '',
      mauMatSo: variant.mauMatSo || '',
      status: variant.status || 'active',
    });
    setShowVariantModal(true);
  };

  // Xử lý tải nhiều ảnh biến thể từ máy tính
  const handleVariantImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const validFiles = fileList.filter((f) => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'].includes(f.type);
      const isValidSize = f.size <= 5 * 1024 * 1024;
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      showToast('error', 'Vui lòng chọn các tệp ảnh hợp lệ (JPG, PNG, WEBP, GIF dưới 5MB).');
      return;
    }

    try {
      setUploadingVariantImages(true);
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await apiClient.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success && Array.isArray(res.data.data)) {
        const newUrls = res.data.data.map((item: any) => item.url);
        setVariantImages((prev) => [...prev, ...newUrls]);
        showToast('success', `Đã tải lên ${newUrls.length} ảnh cho biến thể!`);
      } else {
        showToast('error', 'Không nhận được dữ liệu ảnh sau khi tải.');
      }
    } catch (err: any) {
      console.error('Lỗi tải ảnh biến thể:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi tải ảnh lên máy chủ';
      showToast('error', msg);
    } finally {
      setUploadingVariantImages(false);
      if (variantFileInputRef.current) {
        variantFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveVariantImage = (indexToRemove: number) => {
    setVariantImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Xử lý lưu biến thể (Thêm mới hoặc Cập nhật)
  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProduct) return;

    if (!variantForm.sku.trim()) {
      showToast('error', 'Vui lòng nhập mã SKU biến thể.');
      return;
    }
    if (!variantForm.price || Number(variantForm.price) <= 0) {
      showToast('error', 'Vui lòng nhập giá bán của biến thể.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        sku: variantForm.sku.trim().toUpperCase(),
        price: Number(variantForm.price),
        costPrice: variantForm.costPrice ? Number(variantForm.costPrice) : null,
        mauMatSo: variantForm.mauMatSo || null,
        status: variantForm.status,
        images: variantImages,
      };

      if (editingVariant) {
        const res = await apiClient.put(`/products/${targetProduct.id}/variants/${editingVariant.id}`, payload);
        if (res.data?.success) {
          showToast('success', `Đã cập nhật biến thể SKU: ${payload.sku}`);
        }
      } else {
        const res = await apiClient.post(`/products/${targetProduct.id}/variants`, payload);
        if (res.data?.success) {
          showToast('success', `Đã thêm biến thể ${payload.sku} cho đồng hồ ${targetProduct.name}`);
        }
      }

      setShowVariantModal(false);
      setEditingVariant(null);
      setTargetProduct(null);
      setVariantImages([]);
      await fetchData();
    } catch (err: any) {
      console.error('Lỗi lưu biến thể:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể lưu biến thể';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý xóa biến thể
  const handleConfirmDeleteVariant = async () => {
    if (!deletingVariant) return;
    try {
      setSubmitting(true);
      const { product, variant } = deletingVariant;
      const res = await apiClient.delete(`/products/${product.id}/variants/${variant.id}`);
      if (res.data?.success) {
        showToast('success', `Đã xóa biến thể ${variant.sku}`);
        setDeletingVariant(null);
        await fetchData();
      }
    } catch (err: any) {
      console.error('Lỗi xóa biến thể:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể xóa biến thể';
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Lọc sản phẩm hiển thị
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.variants && p.variants.some((v) => v.sku.toLowerCase().includes(search.toLowerCase())));

    const matchBrand =
      selectedBrand === 'all' || (p.brandId && String(p.brandId) === selectedBrand);

    return matchSearch && matchBrand;
  });

  return (
    <AdminShell
      title="Kho Đồng Hồ & Mẫu Mã BRU_WATCH"
      subtitle="Quản lý danh mục sản phẩm, biến thể (SKU), số serial và cấu hình chế tác"
    >
      <div className="space-y-6">
        {/* Toast thông báo */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 backdrop-blur-md transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-[#00844e]/90 text-white border-emerald-400/40'
                : 'bg-red-950/90 text-white border-red-500/40'
            }`}
          >
            <FontAwesomeIcon
              icon={toast.type === 'success' ? faCircleCheck : faTriangleExclamation}
              className="text-lg"
            />
            <span className="text-xs font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-stone-300 hover:text-white">
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>
          </div>
        )}

        {/* Top Control Bar */}
        <div className="luxury-card rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#d4af37]/15 bg-[#0a120e]">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên mẫu, mã ref, mã SKU biến thể..."
                className="w-full pl-9 pr-3 py-2 bg-[#070e0a] rounded-lg border border-white/[0.08] text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#d4af37] transition-colors"
              />
            </div>

            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                aria-label="Lọc theo thương hiệu đồng hồ"
                className="px-3 py-2 rounded-lg bg-[#070e0a] text-stone-300 border border-white/[0.08] text-xs focus:outline-none focus:border-[#d4af37] cursor-pointer"
              >
                <option value="all">Tất cả thương hiệu</option>
                {brands.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name} ({b.country || 'Quốc tế'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchData}
              title="Làm mới dữ liệu"
              className="px-3 py-2 rounded-lg bg-white/[0.05] text-stone-300 hover:text-white border border-white/[0.08] text-xs flex items-center gap-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faFilter} className="text-[10px]" />
              Làm Mới
            </button>
          </div>

          {canManageProducts && (
            <button
              onClick={openCreateProductModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/25 transition-all cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} className="text-xs" />
              Nhập Mẫu Đồng Hồ Mới
            </button>
          )}
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faClock} className="text-[#d4af37] text-xs" />
              Tổng Mẫu Đồng Hồ
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{products.length}</p>
          </div>
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faBoxesStacked} className="text-emerald-400 text-xs" />
              Tổng Biến Thể SKU
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">
              {products.reduce((acc, p) => acc + (p.variants?.length || 0), 0)}
            </p>
          </div>
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faTag} className="text-[#d4af37] text-xs" />
              Thương Hiệu
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{brands.length}</p>
          </div>
          <div className="luxury-card rounded-xl p-3.5 border border-white/[0.06] bg-[#09100c]">
            <span className="text-[11px] text-stone-400 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faLayerGroup} className="text-sky-400 text-xs" />
              Phân Loại Danh Mục
            </span>
            <p className="text-xl font-bold text-white mt-1 font-mono">{categories.length}</p>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="luxury-card rounded-xl p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin text-2xl text-[#d4af37]" />
            <p className="text-xs tracking-wider">Đang đồng bộ dữ liệu cỗ máy từ CSDL MySQL...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div className="luxury-card rounded-xl p-12 text-center text-stone-400 flex flex-col items-center justify-center gap-3 border border-dashed border-white/[0.1]">
            <FontAwesomeIcon icon={faClock} className="text-3xl text-stone-500" />
            <p className="text-sm text-stone-300 font-medium">Không tìm thấy sản phẩm nào phù hợp</p>
            <p className="text-xs text-stone-500">
              Bạn có thể bấm &quot;Nhập Mẫu Đồng Hồ Mới&quot; để bổ sung vào danh mục BRU_WATCH.
            </p>
          </div>
        )}

        {/* Product Cards List */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const isExpanded = expandedProductId === product.id;
              const variantCount = product.variants?.length || 0;

              return (
                <div
                  key={product.id}
                  className="luxury-card rounded-xl p-5 flex flex-col justify-between group border border-white/[0.08] hover:border-[#d4af37]/35 bg-[#08100c] transition-all duration-300 shadow-md"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] tracking-wider uppercase font-semibold text-[#d4af37] font-mono">
                          ID: #{product.id} • {product.brand?.name || 'Thương hiệu độc lập'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            product.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                              : 'bg-stone-500/10 text-stone-400 border-stone-500/25'
                          }`}
                        >
                          {product.status === 'active' ? 'Đang kinh doanh' : 'Tạm ẩn'}
                        </span>
                      </div>
                      {canManageProducts && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditProductModal(product)}
                            title="Chỉnh sửa mẫu đồng hồ"
                            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-[#d4af37]/20 text-stone-400 hover:text-[#d4af37] border border-white/[0.08] hover:border-[#d4af37]/40 flex items-center justify-center text-xs transition-colors cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faPenToSquare} />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            title="Xóa mẫu đồng hồ"
                            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 text-stone-400 hover:text-red-400 border border-white/[0.08] hover:border-red-500/40 flex items-center justify-center text-xs transition-colors cursor-pointer"
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Body Card */}
                    <div className="my-4 flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-[#040806] border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37] shrink-0 overflow-hidden shadow-inner">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faClock} className="text-2xl" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white group-hover:text-[#d4af37] transition-colors truncate">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-stone-400 mt-0.5 truncate">
                          {product.category?.name || 'Đồng hồ cao cấp'} • Máy{' '}
                          <span className="uppercase text-stone-300 font-medium">
                            {product.loaiBoMay || 'Automatic'}
                          </span>
                        </p>
                        <p className="text-[10px] text-stone-500 mt-1 font-mono truncate">
                          Slug: /{product.slug}
                        </p>
                      </div>
                    </div>

                    {/* Thông số kỹ thuật nhanh */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#040806]/60 border border-white/[0.04] text-[11px] mb-3">
                      <div>
                        <span className="text-stone-500 block text-[10px]">Kính:</span>
                        <span className="text-stone-300 truncate block">
                          {product.chatLieuKinh || 'Sapphire'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Dây đeo:</span>
                        <span className="text-stone-300 truncate block">
                          {product.chatLieuDayDeo || 'Dây Thép Không Gỉ 316L'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Chống nước:</span>
                        <span className="text-stone-300 truncate block">
                          {product.khaNangChongNuoc || '5 ATM'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Đường kính:</span>
                        <span className="text-stone-300 truncate block">
                          {product.duongKinhMatSo ? `${product.duongKinhMatSo} mm` : 'Tiêu chuẩn'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Bảo hành:</span>
                        <span className="text-stone-300 truncate block">
                          {product.warrantyMonths} tháng
                        </span>
                      </div>
                    </div>

                    {/* Danh sách Tính Năng (Features) */}
                    {product.features && product.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {product.features.map((feat) => (
                          <span
                            key={feat.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00844e]/15 border border-emerald-500/25 text-[10px] text-emerald-300 font-medium"
                          >
                            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[8px] text-emerald-400" />
                            {feat.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Giá niêm yết */}
                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-xs text-stone-400">Giá niêm yết:</span>
                      <span className="text-base font-serif font-bold text-amber-200">
                        {Number(product.basePrice).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>

                    {/* Biến thể Section Toggle */}
                    <div className="mt-3 pt-3 border-t border-white/[0.05]">
                      <button
                        onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                        className="w-full flex items-center justify-between text-xs text-stone-300 hover:text-white py-1 px-2 rounded bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <FontAwesomeIcon icon={faBoxesStacked} className="text-[#d4af37] text-[11px]" />
                          Danh sách biến thể ({variantCount})
                        </span>
                        <FontAwesomeIcon
                          icon={isExpanded ? faChevronUp : faChevronDown}
                          className="text-[10px] text-stone-400"
                        />
                      </button>

                      {/* Expandable Variants List */}
                      {isExpanded && (
                        <div className="mt-2 space-y-2 p-2 rounded-lg bg-[#030604] border border-white/[0.05] animate-fadeIn">
                          {variantCount === 0 ? (
                            <p className="text-[11px] text-stone-500 italic text-center py-2">
                              Chưa có biến thể SKU nào.
                            </p>
                          ) : (
                            product.variants?.map((v) => (
                              <div
                                key={v.id}
                                className="p-2.5 rounded-lg bg-[#070e0a] border border-white/[0.06] hover:border-[#d4af37]/25 flex flex-col gap-1.5 text-[11px] transition-colors group/item"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-semibold text-emerald-400">
                                      {v.sku}
                                    </span>
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[9px] font-medium ${
                                        v.status === 'active'
                                          ? 'text-emerald-400/90'
                                          : 'text-stone-500'
                                      }`}
                                    >
                                      {v.status === 'active' ? '• Mở bán' : '• Ẩn'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-stone-200 font-medium">
                                      {Number(v.price).toLocaleString('vi-VN')} ₫
                                    </span>
                                    {canManageProducts && (
                                      <div className="flex items-center gap-1 opacity-80 group-hover/item:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => openEditVariantModal(product, v)}
                                          title="Chỉnh sửa biến thể SKU này"
                                          className="w-6 h-6 rounded bg-white/[0.05] hover:bg-[#d4af37]/25 text-stone-400 hover:text-[#d4af37] border border-white/[0.06] flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                                        >
                                          <FontAwesomeIcon icon={faPenToSquare} />
                                        </button>
                                        <button
                                          onClick={() => setDeletingVariant({ product, variant: v })}
                                          title="Xóa biến thể SKU này"
                                          className="w-6 h-6 rounded bg-white/[0.05] hover:bg-red-500/25 text-stone-400 hover:text-red-400 border border-white/[0.06] flex items-center justify-center text-[10px] transition-colors cursor-pointer"
                                        >
                                          <FontAwesomeIcon icon={faTrashCan} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-stone-400">
                                  <span>Mặt: <strong className="text-stone-300 font-normal">{v.mauMatSo || 'Mặt tiêu chuẩn'}</strong></span>
                                  <span>Giá riêng: <strong className="text-amber-200/90 font-medium">{Number(v.price).toLocaleString('vi-VN')} ₫</strong></span>
                                </div>
                                {v.images && v.images.length > 0 && (
                                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/[0.04]">
                                    <span className="text-[9px] text-stone-400 flex items-center gap-1 shrink-0">
                                      <FontAwesomeIcon icon={faImage} className="text-[#d4af37] text-[9px]" />
                                      {v.images.length} ảnh:
                                    </span>
                                    <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                                      {v.images.map((img, idx) => (
                                        <div
                                          key={img.id || idx}
                                          className="w-6 h-6 rounded border border-white/[0.1] overflow-hidden shrink-0 bg-[#040806] shadow-sm hover:border-[#d4af37]/60 transition-colors"
                                          title={`Ảnh biến thể #${idx + 1}`}
                                        >
                                          <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                          )}

                          {canManageProducts && (
                            <button
                              onClick={() => openAddVariantModal(product)}
                              className="w-full mt-1.5 py-1.5 px-2 rounded bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                              Thêm Biến Thể Cho Mẫu Này
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
                    <span className="text-stone-400 text-[11px]">
                      Biến thể: <strong className="text-stone-200">{variantCount}</strong>
                    </span>
                    {canManageProducts && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditProductModal(product)}
                          title="Sửa mẫu đồng hồ"
                          className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white border border-white/[0.08] text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="text-[10px]" />
                          Sửa
                        </button>
                        <button
                          onClick={() => openAddVariantModal(product)}
                          title="Thêm biến thể SKU"
                          className="px-2.5 py-1 rounded bg-[#00844e]/15 hover:bg-[#00844e]/30 text-emerald-400 border border-emerald-500/25 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                          + Variant
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL: Thêm / Sửa Sản Phẩm (Product) */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#d4af37]/30 bg-[#070e0a] shadow-2xl p-6 text-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                    <FontAwesomeIcon icon={editingProduct ? faPenToSquare : faClock} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editingProduct ? 'Chỉnh Sửa Mẫu Đồng Hồ' : 'Nhập Mẫu Đồng Hồ Mới'}
                    </h3>
                    <p className="text-xs text-stone-400">
                      {editingProduct
                        ? `Cập nhật thông tin cho mẫu ID: #${editingProduct.id} • ${editingProduct.name}`
                        : 'Tạo bản ghi sản phẩm chuẩn mực vào bảng CSDL MySQL `products`'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    setImagePreview(null);
                  }}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tên sản phẩm */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Tên Mẫu Đồng Hồ <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={handleNameChange}
                      placeholder="VD: Tissot PRX Powermatic 80 Steel"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Slug Định Danh URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.slug}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="VD: tissot-prx-powermatic-80"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37] font-mono"
                    />
                  </div>

                  {/* Giá niêm yết */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Giá Niêm Yết Gốc (VNĐ) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={productForm.basePrice}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, basePrice: e.target.value }))
                      }
                      placeholder="VD: 18500000"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-amber-200 focus:outline-none focus:border-[#d4af37] font-mono font-semibold"
                    />
                  </div>

                  {/* Thương hiệu */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Thương Hiệu (Brand)
                    </label>
                    <select
                      value={productForm.brandId}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, brandId: e.target.value }))
                      }
                      aria-label="Chọn thương hiệu cho sản phẩm"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37] cursor-pointer"
                    >
                      <option value="">-- Chọn thương hiệu --</option>
                      {brands.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {b.name} ({b.country || 'Quốc tế'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Danh mục */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Danh Mục (Category)
                    </label>
                    <select
                      value={productForm.categoryId}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, categoryId: e.target.value }))
                      }
                      aria-label="Chọn danh mục cho sản phẩm"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37] cursor-pointer"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Giới tính */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Đối Tượng Thiết Kế
                    </label>
                    <select
                      value={productForm.gender}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          gender: e.target.value as 'male' | 'female' | 'unisex',
                        }))
                      }
                      aria-label="Chọn đối tượng thiết kế giới tính"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37] cursor-pointer"
                    >
                      <option value="unisex">Unisex (Đa phong cách)</option>
                      <option value="male">Quý Ông (Gentlemen)</option>
                      <option value="female">Quý Cô (Ladies)</option>
                    </select>
                  </div>

                  {/* Bộ máy */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Cỗ Máy Đồng Hồ (Movement)
                    </label>
                    <select
                      value={productForm.loaiBoMay}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          loaiBoMay: e.target.value as any,
                        }))
                      }
                      aria-label="Chọn cỗ máy đồng hồ"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37] cursor-pointer"
                    >
                      <option value="automatic">Automatic (Cơ tự động)</option>
                      <option value="quartz">Quartz (Pin thạch anh)</option>
                      <option value="manual">Manual Wind (Lên cót tay)</option>
                      <option value="solar">Solar (Năng lượng ánh sáng)</option>
                      <option value="smart">Smart (Điện tử thông minh)</option>
                    </select>
                  </div>

                  {/* Chất liệu kính */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">Mặt Kính</label>
                    <input
                      type="text"
                      value={productForm.chatLieuKinh}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, chatLieuKinh: e.target.value }))
                      }
                      placeholder="VD: Sapphire nguyên khối chống lóa"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Niềng */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Chất Liệu Niềng (Bezel)
                    </label>
                    <input
                      type="text"
                      value={productForm.chatLieuNieng}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, chatLieuNieng: e.target.value }))
                      }
                      placeholder="VD: Thép không gỉ 316L mạ PVD"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Chất liệu Dây Đeo */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-medium text-stone-300">
                      Chất Liệu Dây Đeo (Chat_Lieu_Day_Deo)
                    </label>
                    <input
                      type="text"
                      value={productForm.chatLieuDayDeo}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, chatLieuDayDeo: e.target.value }))
                      }
                      placeholder="VD: Dây Thép Không Gỉ 316L, Dây Da Cá Sấu..."
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {SUGGESTED_STRAPS.map((strap) => (
                        <button
                          key={strap}
                          type="button"
                          onClick={() => setProductForm((prev) => ({ ...prev, chatLieuDayDeo: strap }))}
                          className={`px-2 py-0.5 rounded text-[10px] border transition-all cursor-pointer ${
                            productForm.chatLieuDayDeo === strap
                              ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/60 font-medium'
                              : 'bg-white/[0.03] text-stone-400 hover:text-white border-white/[0.08] hover:border-white/[0.2]'
                          }`}
                        >
                          {strap}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Đường kính & Bề dày */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">
                        Đường Kính (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={productForm.duongKinhMatSo}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, duongKinhMatSo: e.target.value }))
                        }
                        placeholder="40.0"
                        className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">
                        Bề Dày (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={productForm.beDayMatSo}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, beDayMatSo: e.target.value }))
                        }
                        placeholder="10.5"
                        className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  {/* Chống nước & Bảo hành */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">
                        Chống Nước
                      </label>
                      <input
                        type="text"
                        value={productForm.khaNangChongNuoc}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, khaNangChongNuoc: e.target.value }))
                        }
                        placeholder="10 ATM (100m)"
                        className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">
                        Bảo Hành (Tháng)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={productForm.warrantyMonths}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            warrantyMonths: Number(e.target.value),
                          }))
                        }
                        placeholder="24"
                        className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  {/* Tải Lên Ảnh Đại Diện Từ Máy Tính */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faImage} className="text-[#d4af37] text-xs" />
                        Ảnh Đại Diện Mẫu Đồng Hồ
                      </span>
                      {uploadingImage && (
                        <span className="text-[10px] text-[#d4af37] flex items-center gap-1 font-mono">
                          <FontAwesomeIcon icon={faSpinner} className="fa-spin text-[10px]" />
                          Đang tải ảnh lên máy chủ...
                        </span>
                      )}
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                      id="product-image-upload-input"
                    />

                    {imagePreview ? (
                      <div className="p-3 rounded-xl bg-[#030604] border border-[#d4af37]/30 flex items-center gap-4 transition-all">
                        <div className="w-20 h-20 rounded-lg bg-[#070e0a] border border-[#d4af37]/40 overflow-hidden shrink-0 flex items-center justify-center shadow-inner relative group">
                          <img
                            src={imagePreview}
                            alt="Xem trước ảnh đồng hồ"
                            className="w-full h-full object-cover"
                          />
                          {uploadingImage && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <FontAwesomeIcon icon={faSpinner} className="fa-spin text-white text-lg" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCheck} className="text-emerald-400 text-xs" />
                            {productForm.imageUrl ? 'Ảnh đã tải lên máy chủ' : 'Đang xử lý ảnh...'}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-0.5 truncate font-mono">
                            {productForm.imageUrl || 'Tệp hình ảnh cục bộ'}
                          </p>

                          <div className="mt-2.5 flex items-center gap-2">
                            <button
                              type="button"
                              disabled={uploadingImage}
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-[#d4af37]/20 text-stone-300 hover:text-[#d4af37] border border-white/[0.08] hover:border-[#d4af37]/40 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <FontAwesomeIcon icon={faCloudArrowUp} className="text-[10px]" />
                              Đổi Ảnh Khác
                            </button>
                            <button
                              type="button"
                              disabled={uploadingImage}
                              onClick={handleRemoveImage}
                              className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-red-500/20 text-stone-300 hover:text-red-400 border border-white/[0.08] hover:border-red-500/40 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                              Xóa Ảnh
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="p-6 rounded-xl bg-[#030604] border border-dashed border-[#d4af37]/30 hover:border-[#d4af37]/70 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group hover:bg-[#070e0a]"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                          <FontAwesomeIcon icon={faCloudArrowUp} className="text-xl" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-stone-200 group-hover:text-white transition-colors">
                            Bấm để chọn tệp ảnh từ máy tính hoặc kéo thả vào đây
                          </p>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            Hỗ trợ JPG, PNG, WEBP, GIF (Dung lượng tối đa 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trạng thái kinh doanh */}
                  {editingProduct && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-stone-300 mb-1">
                        Trạng Thái Kinh Doanh
                      </label>
                      <select
                        value={productForm.status}
                        onChange={(e) =>
                          setProductForm((prev) => ({
                            ...prev,
                            status: e.target.value as any,
                          }))
                        }
                        aria-label="Chọn trạng thái kinh doanh"
                        className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37] cursor-pointer"
                      >
                        <option value="active">Đang kinh doanh (Active)</option>
                        <option value="hidden">Tạm ẩn khỏi trang khách hàng (Hidden)</option>
                        <option value="discontinued">Ngừng sản xuất / Hết hàng vĩnh viễn (Discontinued)</option>
                      </select>
                    </div>
                  )}

                  {/* Tính Năng Kỹ Thuật Đặc Biệt (Features) */}
                  <div className="sm:col-span-2 space-y-2 p-3.5 rounded-xl bg-[#040806] border border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-stone-200 flex items-center gap-2">
                        <FontAwesomeIcon icon={faSliders} className="text-[#d4af37] text-xs" />
                        <span>Tính Năng Kỹ Thuật Đặc Biệt (Features)</span>
                      </label>
                      <span className="text-[10px] text-stone-400">
                        Đã chọn: <strong className="text-emerald-400 font-mono">{productForm.featureIds.length}</strong> tính năng
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 font-light">
                      Bấm vào các thẻ bên dưới để bật/tắt (Một đồng hồ có thể có 0 hoặc nhiều tính năng):
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {features.map((feat) => {
                        const isSelected = productForm.featureIds.includes(feat.id);
                        return (
                          <button
                            key={feat.id}
                            type="button"
                            onClick={() => {
                              setProductForm((prev) => ({
                                ...prev,
                                featureIds: isSelected
                                  ? prev.featureIds.filter((id) => id !== feat.id)
                                  : [...prev.featureIds, feat.id],
                              }));
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#00844e]/25 border border-emerald-400 text-emerald-300 font-medium shadow-md shadow-emerald-950/40'
                                : 'bg-white/[0.04] border border-white/[0.1] text-stone-400 hover:border-white/20 hover:text-stone-200'
                            }`}
                          >
                            <FontAwesomeIcon
                              icon={isSelected ? faCheck : faPlus}
                              className={`text-[10px] ${isSelected ? 'text-emerald-400' : 'text-stone-500'}`}
                            />
                            <span>{feat.name}</span>
                          </button>
                        );
                      })}
                      {features.length === 0 && (
                        <span className="text-xs text-stone-500 italic">
                          Chưa có tính năng nào. Hãy vào trang &quot;Tính Năng Kỹ Thuật&quot; để thiết lập.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mô tả */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Mô Tả Chế Tác
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Mô tả kỹ nghệ hoàn thiện, họa tiết Clous de Paris, khả năng trữ cót..."
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      setEditingProduct(null);
                      setImagePreview(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                        Đang Lưu MySQL...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                        {editingProduct ? 'Cập Nhật Mẫu Sản Phẩm' : 'Lưu Mẫu Sản Phẩm'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Thêm / Sửa Biến Thể (Product Variant) */}
        {showVariantModal && targetProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-lg border border-[#d4af37]/30 bg-[#070e0a] shadow-2xl p-6 text-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FontAwesomeIcon icon={editingVariant ? faPenToSquare : faBoxesStacked} className="text-sm" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editingVariant ? 'Chỉnh Sửa Biến Thể SKU' : 'Thêm Biến Thể Mới (SKU)'}
                    </h3>
                    <p className="text-xs text-stone-400">
                      {editingVariant
                        ? `Cập nhật mã SKU: ${editingVariant.sku} • Mẫu: ${targetProduct.name}`
                        : `Thuộc mẫu: ${targetProduct.name} (ID: ${targetProduct.id})`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowVariantModal(false);
                    setEditingVariant(null);
                    setTargetProduct(null);
                    setVariantImages([]);
                  }}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>

              <form onSubmit={handleSaveVariant} className="mt-5 space-y-4">
                {/* SKU */}
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Mã SKU Duy Nhất <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={variantForm.sku}
                    onChange={(e) =>
                      setVariantForm((prev) => ({ ...prev, sku: e.target.value.toUpperCase() }))
                    }
                    placeholder="VD: TIS-PRX-ICEBLUE"
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-emerald-400 font-mono font-semibold focus:outline-none focus:border-[#d4af37]"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Mã SKU phải là duy nhất trên toàn hệ thống CSDL MySQL.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Giá bán */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Giá Bán Ra (VNĐ) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={variantForm.price}
                      onChange={(e) =>
                        setVariantForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                      placeholder="18500000"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-amber-200 font-mono font-semibold focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Giá vốn */}
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Giá Vốn Nhập (VNĐ)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={variantForm.costPrice}
                      onChange={(e) =>
                        setVariantForm((prev) => ({ ...prev, costPrice: e.target.value }))
                      }
                      placeholder="13500000"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Màu mặt số */}
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Màu Sắc Mặt Số (Mau_Mat_So)
                  </label>
                  <input
                    type="text"
                    value={variantForm.mauMatSo}
                    onChange={(e) =>
                      setVariantForm((prev) => ({ ...prev, mauMatSo: e.target.value }))
                    }
                    placeholder="VD: Xanh Ice Blue, Mặt đen Sunray, Trắng Bạc..."
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                  />
                  {/* Tag gợi ý nhanh màu sắc mặt số */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {SUGGESTED_DIAL_COLORS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setVariantForm((prev) => ({ ...prev, mauMatSo: item.label }))}
                        className={`px-2 py-0.5 rounded text-[10px] border flex items-center gap-1.5 transition-all cursor-pointer ${
                          variantForm.mauMatSo === item.label
                            ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/60 font-medium'
                            : 'bg-white/[0.03] text-stone-400 hover:text-white border-white/[0.08] hover:border-white/[0.2]'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bộ sưu tập hình ảnh biến thể */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faImage} className="text-[#d4af37] text-xs" />
                      Bộ Sưu Tập Hình Ảnh Biến Thể ({variantImages.length} ảnh)
                    </span>
                    {uploadingVariantImages && (
                      <span className="text-[10px] text-[#d4af37] flex items-center gap-1 font-mono">
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-[10px]" />
                        Đang tải ảnh lên...
                      </span>
                    )}
                  </label>

                  <input
                    ref={variantFileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => handleVariantImagesUpload(e.target.files)}
                    className="hidden"
                    id="variant-images-upload-input"
                  />

                  {/* Lưới hiển thị các ảnh đã tải */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mb-2.5">
                    {variantImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square rounded-lg bg-[#030604] border border-white/[0.1] hover:border-[#d4af37]/50 overflow-hidden shadow-inner transition-all"
                      >
                        <img
                          src={imgUrl}
                          alt={`Ảnh biến thể #${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#d4af37]/90 text-black text-[9px] font-bold flex items-center gap-1 shadow">
                            <FontAwesomeIcon icon={faStar} className="text-[8px]" />
                            Chính
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantImage(idx)}
                          title="Xóa ảnh này khỏi biến thể"
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 hover:bg-red-600 text-stone-300 hover:text-white flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow"
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    ))}

                    {/* Nút thêm ảnh */}
                    <button
                      type="button"
                      disabled={uploadingVariantImages}
                      onClick={() => variantFileInputRef.current?.click()}
                      className="aspect-square rounded-lg bg-[#030604] border border-dashed border-[#d4af37]/35 hover:border-[#d4af37] hover:bg-[#d4af37]/10 flex flex-col items-center justify-center gap-1 text-[#d4af37] transition-all cursor-pointer group disabled:opacity-50"
                    >
                      {uploadingVariantImages ? (
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-base" />
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPlus} className="text-base group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-medium text-stone-300">Tải ảnh lên</span>
                        </>
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-stone-500 block">
                    Bạn có thể chọn tải lên nhiều ảnh từ máy tính cùng lúc. Ảnh đầu tiên sẽ tự động làm ảnh đại diện chính của biến thể.
                  </span>
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Trạng Thái Biến Thể
                  </label>
                  <select
                    value={variantForm.status}
                    onChange={(e) =>
                      setVariantForm((prev) => ({
                        ...prev,
                        status: e.target.value as 'active' | 'hidden',
                      }))
                    }
                    aria-label="Chọn trạng thái biến thể"
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37] cursor-pointer"
                  >
                    <option value="active">Kích hoạt mở bán (Active)</option>
                    <option value="hidden">Ẩn tạm thời (Hidden)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVariantModal(false);
                      setEditingVariant(null);
                      setTargetProduct(null);
                      setVariantImages([]);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                        Đang Ghi Vào MySQL...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                        {editingVariant ? 'Cập Nhật Biến Thể' : 'Thêm Biến Thể'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Xác nhận xóa Mẫu Đồng Hồ (Product) */}
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-md border border-red-500/30 bg-[#070e0a] shadow-2xl p-6 text-stone-200">
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-base" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Xác Nhận Xóa Mẫu Đồng Hồ</h3>
                  <p className="text-xs text-stone-400">Hành động này sẽ xóa dữ liệu khỏi hệ thống</p>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-xs text-stone-300 leading-relaxed">
                  Bạn có chắc chắn muốn xóa mẫu đồng hồ{' '}
                  <strong className="text-[#d4af37]">{deletingProduct.name}</strong> (ID: #{deletingProduct.id})?
                </p>
                {deletingProduct.variants && deletingProduct.variants.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/20 text-[11px] text-red-300">
                    Cảnh báo: Mẫu này đang có <strong>{deletingProduct.variants.length} biến thể SKU</strong>.
                    Nếu có đơn hàng hoặc serial liên kết, MySQL sẽ tự động ngăn chặn xóa để bảo toàn dữ liệu.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmDeleteProduct}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                      Đang Xóa...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                      Xác Nhận Xóa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Xác nhận xóa Biến Thể SKU (Variant) */}
        {deletingVariant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-md border border-red-500/30 bg-[#070e0a] shadow-2xl p-6 text-stone-200">
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.08]">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="text-base" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Xác Nhận Xóa Biến Thể SKU</h3>
                  <p className="text-xs text-stone-400">Xóa biến thể khỏi mẫu đồng hồ</p>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <p className="text-xs text-stone-300 leading-relaxed">
                  Bạn có chắc chắn muốn xóa biến thể mã{' '}
                  <strong className="text-emerald-400 font-mono">{deletingVariant.variant.sku}</strong> thuộc mẫu{' '}
                  <strong className="text-[#d4af37]">{deletingVariant.product.name}</strong>?
                </p>
                <div className="p-3 rounded-lg bg-[#040806] border border-white/[0.06] text-[11px] text-stone-400 space-y-1">
                  <div>
                    Giá bán: <span className="font-mono text-stone-200">{Number(deletingVariant.variant.price).toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div>
                    Mặt số: <span className="text-stone-300">{deletingVariant.variant.mauMatSo || 'Tiêu chuẩn'}</span>
                  </div>
                  <div>
                    Dây đeo: <span className="text-stone-300">{deletingVariant.product.chatLieuDayDeo || 'Tiêu chuẩn'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingVariant(null)}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleConfirmDeleteVariant}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                      Đang Xóa...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                      Xác Nhận Xóa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
