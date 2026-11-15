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
  faFileExcel,
  faDownload,
  faWarehouse,
  faBarcode,
  faCircleInfo,
  faCheckDouble,
  faTableList,
  faEye,
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
  mauDayDeo?: string | null;
  mauNieng?: string | null;
  images?: VariantImage[];
  serialNumbers?: Array<{
    id: number;
    serialNumber: string;
    status: string;
    itemCondition?: string;
    location?: string;
    [key: string]: any;
  }>;
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
  khoiLuong?: string | number | null;
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
  parentId?: number | null;
  children?: Category[];
}

function formatCurrencyInput(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  const cleanDigits = String(val).replace(/\D/g, '');
  if (!cleanDigits) return '';
  return cleanDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseCurrencyInput(formatted: string | number | undefined | null): number {
  if (formatted === undefined || formatted === null || formatted === '') return 0;
  const cleanDigits = String(formatted).replace(/\D/g, '');
  return cleanDigits ? Number(cleanDigits) : 0;
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
    khoiLuong: '145.0',
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

  // Modal Bảng Thông Số Kỹ Thuật (Table View)
  const [selectedProductForSpecs, setSelectedProductForSpecs] = useState<Product | null>(null);

  // Modal Nhập Serial Bằng Excel (Admin Import -> Giao Kho Kiểm Tra)
  const [showSerialImportModal, setShowSerialImportModal] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importingExcel, setImportingExcel] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any>(null);
  const excelInputRef = React.useRef<HTMLInputElement | null>(null);

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

  // Gợi ý màu sắc / chất liệu niềng
  const SUGGESTED_BEZEL_COLORS = [
    { label: 'Bạc Silver', color: '#cbd5e1' },
    { label: 'Vàng Gold 18K', color: '#fde047' },
    { label: 'Vàng Hồng Rose Gold', color: '#fb7185' },
    { label: 'Đen Ceramic', color: '#171717' },
    { label: 'Xanh Biển Ceramic', color: '#0284c7' },
    { label: 'Xanh Lá Emerald', color: '#059669' },
    { label: 'Titan Tự Nhiên', color: '#94a3b8' },
  ];

  // Gợi ý màu dây đeo
  const SUGGESTED_STRAP_COLORS = [
    { label: 'Dây Thép Bạc', color: '#cbd5e1' },
    { label: 'Dây Da Nâu', color: '#78350f' },
    { label: 'Dây Da Đen', color: '#1a1a1a' },
    { label: 'Dây Vàng Gold 18K', color: '#fde047' },
    { label: 'Dây Demi Vàng', color: '#eab308' },
    { label: 'Dây Cao Su Đen', color: '#0f172a' },
    { label: 'Dây Xanh Hải Quân', color: '#1e3a8a' },
  ];

  // Danh sách các tag gợi ý Mặt Kính cho Product form
  const SUGGESTED_GLASS = [
    'Kính Sapphire nguyên khối',
    'Sapphire cong phủ AR chống lóa',
    'Sapphire Cyclops phóng đại lịch',
    'Kính Khoáng Mineral Crystal',
    'Kính Vòm Hardlex siêu bền',
    'Kính Hesalite phong cách Retro',
  ];

  // Danh sách các tag gợi ý Chất Liệu Niềng cho Product form
  const SUGGESTED_BEZEL_MATERIALS = [
    'Thép không gỉ 316L',
    'Thép 904L Oystersteel',
    'Gốm Ceramic chống trầy',
    'Vàng Gold 18K nguyên khối',
    'Vàng Hồng Everose 18K',
    'Vàng Trắng White Gold 18K',
    'Titanium Grade 5 siêu nhẹ',
    'Bạch Kim Platinum 950',
    'Niềng đính kim cương',
    'Carbon Forged siêu bền',
  ];

  // Danh sách các tag gợi ý chất liệu dây đeo cho Product form
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
    mauDayDeo: 'Dây Thép Bạc',
    mauNieng: 'Bạc Silver',
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
      khoiLuong: product.khoiLuong ? String(product.khoiLuong) : '',
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
    const cleanBasePrice = parseCurrencyInput(productForm.basePrice);
    if (!cleanBasePrice || cleanBasePrice <= 0) {
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
        basePrice: cleanBasePrice,
        gender: productForm.gender,
        loaiBoMay: productForm.loaiBoMay,
        chatLieuKinh: productForm.chatLieuKinh || null,
        duongKinhMatSo: productForm.duongKinhMatSo ? Number(productForm.duongKinhMatSo) : null,
        beDayMatSo: productForm.beDayMatSo ? Number(productForm.beDayMatSo) : null,
        khoiLuong: productForm.khoiLuong ? Number(productForm.khoiLuong) : null,
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
      let msg = err.response?.data?.message || err.message || 'Không thể lưu thông tin sản phẩm';
      if (err.response?.status === 409) {
        msg = 'Dữ liệu (Tên hoặc Slug) đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.';
      }
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
      mauDayDeo: 'Dây Thép Bạc',
      mauNieng: 'Bạc Silver',
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
      mauDayDeo: variant.mauDayDeo || '',
      mauNieng: variant.mauNieng || '',
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
    const cleanPrice = parseCurrencyInput(variantForm.price);
    const cleanCostPrice = variantForm.costPrice ? parseCurrencyInput(variantForm.costPrice) : null;
    if (!cleanPrice || cleanPrice <= 0) {
      showToast('error', 'Vui lòng nhập giá bán của biến thể.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        sku: variantForm.sku.trim().toUpperCase(),
        price: cleanPrice,
        costPrice: cleanCostPrice,
        mauMatSo: variantForm.mauMatSo || null,
        mauDayDeo: variantForm.mauDayDeo || null,
        mauNieng: variantForm.mauNieng || null,
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

  // Tải file mẫu Excel
  const handleDownloadSerialTemplate = async () => {
    try {
      const res = await apiClient.get('/serials/template', {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'BRU_WATCH_Serial_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('success', 'Đã tải xuống file Excel mẫu thành công.');
    } catch (err: any) {
      console.error('Lỗi tải file mẫu:', err);
      showToast('error', 'Không thể tải file Excel mẫu. Vui lòng thử lại.');
    }
  };

  // Upload file Excel serials
  const handleImportSerialsExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) {
      showToast('error', 'Vui lòng chọn file Excel (.xlsx / .xls / .csv) để nhập.');
      return;
    }

    try {
      setImportingExcel(true);
      setImportResult(null);
      const formData = new FormData();
      formData.append('file', excelFile);

      const res = await apiClient.post('/serials/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        setImportResult(res.data.data);
        showToast('success', res.data.message || 'Đã nhập danh sách số Serial thành công!');
        await fetchData();
      }
    } catch (err: any) {
      console.error('Lỗi upload Excel serials:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể xử lý file Excel';
      showToast('error', msg);
    } finally {
      setImportingExcel(false);
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

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {canManageProducts && (
              <>
                <button
                  onClick={() => {
                    setExcelFile(null);
                    setImportResult(null);
                    setShowSerialImportModal(true);
                  }}
                  className="w-full sm:w-auto px-3.5 py-2.5 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] text-xs font-medium flex items-center justify-center gap-2 border border-[#d4af37]/35 shadow-sm transition-all cursor-pointer"
                >
                  <FontAwesomeIcon icon={faFileExcel} className="text-xs text-emerald-400" />
                  Nhập Serial Excel
                </button>
                <button
                  onClick={openCreateProductModal}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/25 transition-all cursor-pointer"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                  Nhập Mẫu Đồng Hồ Mới
                </button>
              </>
            )}
          </div>
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
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#040806]/60 border border-white/[0.04] text-[11px] mb-2">
                      <div>
                        <span className="text-stone-500 block text-[10px]">Kính:</span>
                        <span className="text-stone-300 truncate block">
                          {product.chatLieuKinh || 'Kính Sapphire'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Niềng:</span>
                        <span className="text-stone-300 truncate block">
                          {product.chatLieuNieng || 'Thép không gỉ 316L'}
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
                          {product.khaNangChongNuoc || '10 ATM'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Đường kính / Dày:</span>
                        <span className="text-stone-300 truncate block">
                          {product.duongKinhMatSo ? `${product.duongKinhMatSo} mm` : '40 mm'} / {product.beDayMatSo ? `${product.beDayMatSo} mm` : '10.5 mm'}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Khối lượng:</span>
                        <span className="text-stone-300 truncate block">
                          {product.khoiLuong ? `${product.khoiLuong} g` : '145 g'}
                        </span>
                      </div>
                    </div>

                    {/* Nút Xem Chi Tiết Bảng Thông Số */}
                    <button
                      type="button"
                      onClick={() => setSelectedProductForSpecs(product)}
                      className="w-full py-1.5 px-2.5 mb-3 rounded-lg bg-white/[0.03] hover:bg-[#d4af37]/15 text-stone-300 hover:text-[#d4af37] border border-white/[0.06] hover:border-[#d4af37]/35 text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FontAwesomeIcon icon={faTableList} className="text-[#d4af37] text-[10px]" />
                      Bảng Thông Số Chi Tiết
                    </button>

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
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                      Sẵn bán: {v.serialNumbers?.filter((s: any) => s.status === 'available').length || 0} seri
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
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-stone-400">
                                  <span>Mặt: <strong className="text-stone-300 font-normal">{v.mauMatSo || 'Mặt tiêu chuẩn'}</strong></span>
                                  {v.mauNieng && <span>Niềng: <strong className="text-[#d4af37] font-normal">{v.mauNieng}</strong></span>}
                                  {v.mauDayDeo && <span>Dây: <strong className="text-stone-300 font-normal">{v.mauDayDeo}</strong></span>}
                                  <span>Giá: <strong className="text-amber-200/90 font-medium">{Number(v.price).toLocaleString('vi-VN')} ₫</strong></span>
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
                      type="text"
                      inputMode="numeric"
                      required
                      value={formatCurrencyInput(productForm.basePrice)}
                      onChange={(e) => {
                        const rawVal = e.target.value.replace(/\D/g, '');
                        setProductForm((prev) => ({ ...prev, basePrice: rawVal }));
                      }}
                      placeholder="VD: 123.456.789"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-amber-200 focus:outline-none focus:border-[#d4af37] font-mono font-semibold"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Tự động phân tách dấu chấm (VD: 123.456.789 ₫), hỗ trợ mọi mức giá lẻ.
                    </span>
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
                        <React.Fragment key={c.id}>
                          <option value={String(c.id)} className="font-semibold text-[#d4af37] bg-[#0c1610]">
                            📁 {c.name} (Danh mục gốc)
                          </option>
                          {c.children && c.children.length > 0 &&
                            c.children.map((child) => (
                              <option key={child.id} value={String(child.id)} className="text-stone-300 bg-[#070e0a]">
                                &nbsp;&nbsp;&nbsp;&nbsp;↳ {child.name}
                              </option>
                            ))}
                        </React.Fragment>
                      ))}
                    </select>
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Hỗ trợ chọn trực tiếp danh mục gốc (📁) hoặc danh mục con phân cấp (↳).
                    </span>
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
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-stone-300">
                        Mặt Kính (Chat_Lieu_Kinh)
                      </label>
                      <span className="text-[10px] text-stone-500">Chọn nhanh gợi ý hoặc tự nhập tay</span>
                    </div>
                    <input
                      type="text"
                      value={productForm.chatLieuKinh}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, chatLieuKinh: e.target.value }))
                      }
                      placeholder="VD: Kính Sapphire nguyên khối chống phản chiếu"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {SUGGESTED_GLASS.map((glass) => (
                        <button
                          key={glass}
                          type="button"
                          onClick={() => setProductForm((prev) => ({ ...prev, chatLieuKinh: glass }))}
                          className={`px-2 py-0.5 rounded text-[10px] border transition-all cursor-pointer ${
                            productForm.chatLieuKinh === glass
                              ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/60 font-medium'
                              : 'bg-white/[0.03] text-stone-400 hover:text-white border-white/[0.08] hover:border-white/[0.2]'
                          }`}
                        >
                          {glass}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Niềng */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-stone-300">
                        Chất Liệu Niềng (Bezel)
                      </label>
                      <span className="text-[10px] text-stone-500">Chọn nhanh gợi ý hoặc tự nhập tay</span>
                    </div>
                    <input
                      type="text"
                      value={productForm.chatLieuNieng}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, chatLieuNieng: e.target.value }))
                      }
                      placeholder="VD: Thép không gỉ 316L, Ceramic chống trầy..."
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {SUGGESTED_BEZEL_MATERIALS.map((bezel) => (
                        <button
                          key={bezel}
                          type="button"
                          onClick={() => setProductForm((prev) => ({ ...prev, chatLieuNieng: bezel }))}
                          className={`px-2 py-0.5 rounded text-[10px] border transition-all cursor-pointer ${
                            productForm.chatLieuNieng === bezel
                              ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/60 font-medium'
                              : 'bg-white/[0.03] text-stone-400 hover:text-white border-white/[0.08] hover:border-white/[0.2]'
                          }`}
                        >
                          {bezel}
                        </button>
                      ))}
                    </div>
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

                  {/* Đường kính, Bề dày & Khối lượng */}
                  <div className="grid grid-cols-3 gap-2">
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
                    <div>
                      <label className="block text-xs font-medium text-stone-300 mb-1">
                        Khối Lượng (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={productForm.khoiLuong}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, khoiLuong: e.target.value }))
                        }
                        placeholder="145.0"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#d4af37]/30 bg-[#070e0a] shadow-2xl overflow-hidden text-stone-200">
              {/* Header cố định trên đỉnh */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] shrink-0 bg-[#070e0a]">
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
                  type="button"
                  onClick={() => {
                    setShowVariantModal(false);
                    setEditingVariant(null);
                    setTargetProduct(null);
                    setVariantImages([]);
                  }}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>

              {/* Form body cuộn mượt mà bên trong, không bao giờ tràn màn hình */}
              <form id="variant-form" onSubmit={handleSaveVariant} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Hàng 1: SKU & Trạng thái */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      Mã định danh duy nhất trên toàn hệ thống MySQL.
                    </span>
                  </div>

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
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Cho phép khách hàng xem và mua SKU này trên web.
                    </span>
                  </div>
                </div>

                {/* Hàng 2: Giá bán & Giá vốn với định dạng chấm 3 chữ số */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Giá Bán Ra (VNĐ) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formatCurrencyInput(variantForm.price)}
                      onChange={(e) => {
                        const rawVal = e.target.value.replace(/\D/g, '');
                        setVariantForm((prev) => ({ ...prev, price: rawVal }));
                      }}
                      placeholder="VD: 123.456.789"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-amber-200 font-mono font-semibold focus:outline-none focus:border-[#d4af37]"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Tự động thêm dấu . mỗi 3 chữ số (VD: 123.456.789 ₫)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Giá Vốn Nhập (VNĐ)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatCurrencyInput(variantForm.costPrice)}
                      onChange={(e) => {
                        const rawVal = e.target.value.replace(/\D/g, '');
                        setVariantForm((prev) => ({ ...prev, costPrice: rawVal }));
                      }}
                      placeholder="VD: 90.000.000"
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      Giá vốn nhập nội bộ tính toán biên lợi nhuận.
                    </span>
                  </div>
                </div>

                {/* Hàng 3: Màu mặt số */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-stone-300">
                      Màu Sắc Mặt Số (Mau_Mat_So)
                    </label>
                    <span className="text-[10px] text-stone-500">Nhập tay hoặc chọn nhanh bên dưới</span>
                  </div>
                  <input
                    type="text"
                    value={variantForm.mauMatSo}
                    onChange={(e) =>
                      setVariantForm((prev) => ({ ...prev, mauMatSo: e.target.value }))
                    }
                    placeholder="VD: Xanh Ice Blue, Mặt đen Sunray, Trắng Bạc..."
                    className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                  />
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

                {/* Hàng 4: Màu Niềng & Màu Dây Đeo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Màu Niềng (Mau_Nieng)
                    </label>
                    <input
                      type="text"
                      value={variantForm.mauNieng}
                      onChange={(e) =>
                        setVariantForm((prev) => ({ ...prev, mauNieng: e.target.value }))
                      }
                      placeholder="VD: Bạc Silver, Vàng Gold 18K..."
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {SUGGESTED_BEZEL_COLORS.slice(0, 5).map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setVariantForm((prev) => ({ ...prev, mauNieng: item.label }))}
                          className={`px-1.5 py-0.5 rounded text-[9px] border flex items-center gap-1 transition-all cursor-pointer ${
                            variantForm.mauNieng === item.label
                              ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/60'
                              : 'bg-white/[0.03] text-stone-400 hover:text-white border-white/[0.08]'
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full border border-white/20"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Màu Dây Đeo (Mau_Day_Deo)
                    </label>
                    <input
                      type="text"
                      value={variantForm.mauDayDeo}
                      onChange={(e) =>
                        setVariantForm((prev) => ({ ...prev, mauDayDeo: e.target.value }))
                      }
                      placeholder="VD: Dây Thép Bạc, Da Nâu..."
                      className="w-full px-3 py-2 bg-[#030604] rounded-lg border border-white/[0.1] text-xs text-stone-300 focus:outline-none focus:border-[#d4af37]"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {SUGGESTED_STRAP_COLORS.slice(0, 5).map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setVariantForm((prev) => ({ ...prev, mauDayDeo: item.label }))}
                          className={`px-1.5 py-0.5 rounded text-[9px] border flex items-center gap-1 transition-all cursor-pointer ${
                            variantForm.mauDayDeo === item.label
                              ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/60'
                              : 'bg-white/[0.03] text-stone-400 hover:text-white border-white/[0.08]'
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full border border-white/20"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hàng 5: Bộ sưu tập hình ảnh biến thể */}
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-stone-300">
                      <FontAwesomeIcon icon={faImage} className="text-[#d4af37] text-xs" />
                      Bộ Sưu Tập Hình Ảnh Biến Thể ({variantImages.length} ảnh)
                    </span>
                    {uploadingVariantImages && (
                      <span className="text-[10px] text-[#d4af37] flex items-center gap-1 font-mono">
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-[10px]" />
                        Đang tải ảnh lên...
                      </span>
                    )}
                  </div>

                  <input
                    ref={variantFileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => handleVariantImagesUpload(e.target.files)}
                    className="hidden"
                    id="variant-images-upload-input"
                  />

                  {/* Lưới hiển thị các ảnh gọn gàng hơn */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
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
                          <span className="absolute top-1 left-1 px-1 py-0.5 rounded bg-[#d4af37]/90 text-black text-[8px] font-bold flex items-center gap-0.5 shadow">
                            <FontAwesomeIcon icon={faStar} className="text-[7px]" />
                            Chính
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantImage(idx)}
                          title="Xóa ảnh này khỏi biến thể"
                          className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 hover:bg-red-600 text-stone-300 hover:text-white flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow"
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      disabled={uploadingVariantImages}
                      onClick={() => variantFileInputRef.current?.click()}
                      className="aspect-square rounded-lg bg-[#030604] border border-dashed border-[#d4af37]/35 hover:border-[#d4af37] hover:bg-[#d4af37]/10 flex flex-col items-center justify-center gap-1 text-[#d4af37] transition-all cursor-pointer group disabled:opacity-50"
                    >
                      {uploadingVariantImages ? (
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-sm" />
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPlus} className="text-sm group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] font-medium text-stone-300">Tải ảnh</span>
                        </>
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] text-stone-500 block">
                    Tải nhiều ảnh cùng lúc từ máy tính. Ảnh đầu tiên làm ảnh đại diện chính.
                  </span>
                </div>
              </form>

              {/* Footer cố định dưới đáy: Luôn luôn hiển thị đầy đủ các nút bấm */}
              <div className="p-4 border-t border-white/[0.08] bg-[#040806] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowVariantModal(false);
                    setEditingVariant(null);
                    setTargetProduct(null);
                    setVariantImages([]);
                  }}
                  className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  form="variant-form"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
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
        {/* MODAL: Bảng Thông Số Kỹ Thuật Đầy Đủ (Table View) */}
        {selectedProductForSpecs && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[#d4af37]/40 bg-[#070e0a] shadow-2xl p-6 text-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                    <FontAwesomeIcon icon={faTableList} className="text-base" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Bảng Thông Số Kỹ Thuật Chi Tiết</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 font-mono">
                        #{selectedProductForSpecs.id}
                      </span>
                    </h3>
                    <p className="text-xs text-stone-400">
                      {selectedProductForSpecs.name} • {selectedProductForSpecs.brand?.name || 'Thương hiệu'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProductForSpecs(null)}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>

              <div className="py-4 space-y-5">
                {/* Bảng thông số chính */}
                <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#030604]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white/[0.03] text-stone-400 border-b border-white/[0.06] text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-1/3">Hạng Mục Thông Số</th>
                        <th className="py-3 px-4 w-2/3">Quy Chuẩn / Giá Trị Chế Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Tên Mẫu Đồng Hồ</td>
                        <td className="py-2.5 px-4 text-white font-semibold">{selectedProductForSpecs.name}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Định Danh Đường Dẫn (Slug)</td>
                        <td className="py-2.5 px-4 font-mono text-emerald-400">/{selectedProductForSpecs.slug}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Thương Hiệu & Xuất Xứ</td>
                        <td className="py-2.5 px-4 text-stone-200">
                          {selectedProductForSpecs.brand?.name || 'BRU_WATCH Exclusive'} 
                          {selectedProductForSpecs.brand?.country && ` (Xuất xứ ${selectedProductForSpecs.brand.country})`}
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Danh Mục Phân Khúc</td>
                        <td className="py-2.5 px-4 text-stone-200">{selectedProductForSpecs.category?.name || 'Đồng hồ cao cấp'}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Giá Niêm Yết Tiêu Chuẩn</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-amber-200 text-sm">
                          {Number(selectedProductForSpecs.basePrice).toLocaleString('vi-VN')} ₫
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Cỗ Máy Đồng Hồ (Movement)</td>
                        <td className="py-2.5 px-4 text-stone-200 uppercase font-semibold text-emerald-400">
                          {selectedProductForSpecs.loaiBoMay || 'Automatic (Cơ tự động)'}
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] bg-[#d4af37]/[0.02]">
                        <td className="py-2.5 px-4 text-[#d4af37] font-medium">Chất Liệu Mặt Kính (Glass)</td>
                        <td className="py-2.5 px-4 text-white font-medium">{selectedProductForSpecs.chatLieuKinh || 'Kính Sapphire nguyên khối chống trầy xước'}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02] bg-[#d4af37]/[0.02]">
                        <td className="py-2.5 px-4 text-[#d4af37] font-medium">Chất Liệu Niềng (Bezel)</td>
                        <td className="py-2.5 px-4 text-white font-medium">{selectedProductForSpecs.chatLieuNieng || 'Thép không gỉ 316L Thụy Sĩ'}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Chất Liệu Dây Đeo</td>
                        <td className="py-2.5 px-4 text-stone-200">{selectedProductForSpecs.chatLieuDayDeo || 'Dây Thép Không Gỉ 316L'}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Khối Lượng Thân Máy (Weight)</td>
                        <td className="py-2.5 px-4 font-mono font-semibold text-stone-200">
                          {selectedProductForSpecs.khoiLuong ? `${selectedProductForSpecs.khoiLuong} gram (g)` : '145.0 gram (g)'}
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Đường Kính & Bề Dày</td>
                        <td className="py-2.5 px-4 font-mono text-stone-200">
                          Đường kính: {selectedProductForSpecs.duongKinhMatSo || 40.0} mm | Bề dày: {selectedProductForSpecs.beDayMatSo || 10.5} mm
                        </td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Khả Năng Kháng Nước</td>
                        <td className="py-2.5 px-4 text-stone-200">{selectedProductForSpecs.khaNangChongNuoc || '10 ATM (100m)'}</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Bảo Hành Chính Hãng</td>
                        <td className="py-2.5 px-4 text-stone-200">{selectedProductForSpecs.warrantyMonths || 24} Tháng Quốc Tế</td>
                      </tr>
                      <tr className="hover:bg-white/[0.02]">
                        <td className="py-2.5 px-4 text-stone-400 font-medium">Đối Tượng Phù Hợp</td>
                        <td className="py-2.5 px-4 text-stone-200">
                          {selectedProductForSpecs.gender === 'male' ? 'Quý Ông (Gentlemen)' : selectedProductForSpecs.gender === 'female' ? 'Quý Cô (Ladies)' : 'Unisex (Đa phong cách)'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Danh sách biến thể SKU */}
                <div>
                  <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBoxesStacked} className="text-[#d4af37]" />
                    <span>Danh Sách Biến Thể SKU ({selectedProductForSpecs.variants?.length || 0})</span>
                  </h4>
                  <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#030604]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-white/[0.03] text-stone-400 border-b border-white/[0.06] text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Mã SKU</th>
                          <th className="py-2.5 px-3">Mặt Số</th>
                          <th className="py-2.5 px-3">Màu Niềng</th>
                          <th className="py-2.5 px-3">Màu Dây</th>
                          <th className="py-2.5 px-3 text-right">Giá Bán</th>
                          <th className="py-2.5 px-3">Seri Khả Dụng (Sẵn Bán)</th>
                          <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {selectedProductForSpecs.variants && selectedProductForSpecs.variants.length > 0 ? (
                          selectedProductForSpecs.variants.map((v) => (
                            <tr key={v.id} className="hover:bg-white/[0.02]">
                              <td className="py-2 px-3 font-mono font-semibold text-emerald-400">{v.sku}</td>
                              <td className="py-2 px-3 text-stone-300">{v.mauMatSo || 'Mặt tiêu chuẩn'}</td>
                              <td className="py-2 px-3 text-[#d4af37]">{v.mauNieng || selectedProductForSpecs.chatLieuNieng || 'Tiêu chuẩn'}</td>
                              <td className="py-2 px-3 text-stone-300">{v.mauDayDeo || selectedProductForSpecs.chatLieuDayDeo || 'Tiêu chuẩn'}</td>
                              <td className="py-2 px-3 text-right font-mono font-medium text-amber-200">
                                {Number(v.price).toLocaleString('vi-VN')} ₫
                              </td>
                              <td className="py-2 px-3">
                                {v.serialNumbers && v.serialNumbers.filter((s: any) => s.status === 'available').length > 0 ? (
                                  <div className="flex flex-wrap gap-1 max-w-[220px]">
                                    {v.serialNumbers
                                      .filter((s: any) => s.status === 'available')
                                      .map((s: any) => (
                                        <span
                                          key={s.id}
                                          title={`Số Serial khả dụng: ${s.serialNumber}`}
                                          className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[9px] font-bold"
                                        >
                                          {s.serialNumber}
                                        </span>
                                      ))}
                                  </div>
                                ) : (
                                  <span className="text-stone-500 italic text-[10px]">Chưa có seri sẵn sàng</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${v.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-stone-500/15 text-stone-400'}`}>
                                  {v.status === 'active' ? 'Mở bán' : 'Ẩn'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-4 text-center text-stone-500 italic">
                              Chưa có biến thể SKU nào cho mẫu này.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedProductForSpecs(null)}
                  className="px-5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-stone-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Đóng Bảng Thông Số
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Nhập Danh Sách Serial Hàng Loạt Bằng Excel */}
        {showSerialImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="luxury-card rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-[#d4af37]/40 bg-[#070e0a] shadow-2xl p-6 text-stone-200">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FontAwesomeIcon icon={faFileExcel} className="text-base" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Nhập Serial Bằng File Excel</h3>
                    <p className="text-xs text-stone-400">Luồng đồng bộ: Admin đẩy file -&gt; Chuyển giao kho kiểm tra</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSerialImportModal(false);
                    setExcelFile(null);
                    setImportResult(null);
                  }}
                  className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="text-sm" />
                </button>
              </div>

              {/* Hướng dẫn quy trình 3 bước */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#030604] border border-white/[0.06] space-y-2">
                <span className="text-[11px] font-semibold text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCircleInfo} className="text-xs" />
                  Quy Trình Quản Lý Serial Hàng Mới
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-stone-400">
                  <div className="p-2 rounded bg-white/[0.03] border border-white/[0.04]">
                    <strong className="text-stone-300 block mb-0.5">1. Admin tạo SKU</strong>
                    Tạo mẫu và các mã biến thể SKU đồng hồ trước trên hệ thống.
                  </div>
                  <div className="p-2 rounded bg-[#d4af37]/10 border border-[#d4af37]/25 text-[#d4af37]">
                    <strong className="text-amber-200 block mb-0.5">2. Tải File Excel</strong>
                    Admin upload file ghép SKU và số Serial. Trạng thái: Chờ kiểm kho.
                  </div>
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                    <strong className="text-emerald-200 block mb-0.5">3. Kho Xác Nhận</strong>
                    Nhân viên kho đối chiếu hàng thực tế & xác nhận mở bán (Available).
                  </div>
                </div>
              </div>

              {/* Tải file mẫu */}
              <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Chưa có file mẫu Excel?</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Tải file mẫu chuẩn đã điền sẵn danh sách SKU đang có trong hệ thống
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSerialTemplate}
                  className="px-3 py-2 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] border border-[#d4af37]/35 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <FontAwesomeIcon icon={faDownload} className="text-xs" />
                  Tải File Mẫu (.xlsx)
                </button>
              </div>

              {/* Form Upload */}
              <form onSubmit={handleImportSerialsExcel} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Chọn File Excel Danh Sách Serial (.xlsx, .xls, .csv) <span className="text-red-400">*</span>
                  </label>
                  <div
                    onClick={() => excelInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      excelFile
                        ? 'border-emerald-500/60 bg-emerald-500/5 text-emerald-300'
                        : 'border-white/[0.12] hover:border-[#d4af37]/50 bg-[#040806] text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setExcelFile(file);
                        setImportResult(null);
                      }}
                      className="hidden"
                    />
                    <FontAwesomeIcon
                      icon={excelFile ? faCircleCheck : faCloudArrowUp}
                      className={`text-3xl mb-2 ${excelFile ? 'text-emerald-400' : 'text-[#d4af37]'}`}
                    />
                    {excelFile ? (
                      <div>
                        <p className="text-xs font-semibold text-emerald-300">{excelFile.name}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          Kích thước: {(excelFile.size / 1024).toFixed(1)} KB • Bấm để chọn file khác
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-medium">Bấm vào đây để chọn file Excel từ máy tính</p>
                        <p className="text-[10px] text-stone-500 mt-1">Định dạng hỗ trợ: .xlsx, .xls, .csv</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kết quả sau khi upload */}
                {importResult && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <FontAwesomeIcon icon={faCheckDouble} className="text-sm" />
                      <span>Nhập Dữ Liệu Thành Công!</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded bg-black/30 border border-white/[0.04]">
                        <span className="text-stone-400 block text-[10px]">Tổng đọc được:</span>
                        <span className="font-mono font-bold text-white text-sm">{importResult.totalRows || 0}</span>
                      </div>
                      <div className="p-2 rounded bg-black/30 border border-white/[0.04]">
                        <span className="text-stone-400 block text-[10px]">Thêm mới:</span>
                        <span className="font-mono font-bold text-emerald-400 text-sm">+{importResult.createdCount || 0}</span>
                      </div>
                      <div className="p-2 rounded bg-black/30 border border-white/[0.04]">
                        <span className="text-stone-400 block text-[10px]">Cập nhật:</span>
                        <span className="font-mono font-bold text-sky-400 text-sm">{importResult.updatedCount || 0}</span>
                      </div>
                      <div className="p-2 rounded bg-black/30 border border-white/[0.04]">
                        <span className="text-stone-400 block text-[10px]">Bỏ qua/Lỗi:</span>
                        <span className="font-mono font-bold text-amber-300 text-sm">{importResult.errorsCount || 0}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-300 pt-1 leading-relaxed">
                      Toàn bộ số Serial trên đã được chuyển sang trạng thái{' '}
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-semibold">
                        pending_warehouse_check (Chờ kiểm kho)
                      </span>
                      . Vui lòng thông báo nhân viên kho tiến hành đối chiếu tại trang <strong>Kiểm Kho & Serial</strong>.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSerialImportModal(false);
                      setExcelFile(null);
                      setImportResult(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 text-xs transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={!excelFile || importingExcel}
                    className="px-5 py-2 rounded-lg bg-[#00844e] hover:bg-[#009b5c] text-white text-xs font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {importingExcel ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="fa-spin text-xs" />
                        Đang Xử Lý File Excel...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-xs" />
                        Tiến Hành Nhập & Đẩy Kho Kiểm Tra
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
