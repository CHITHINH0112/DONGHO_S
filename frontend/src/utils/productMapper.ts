import { WatchItem, WatchVariant } from '@/data/watches';

export function normalizeImageUrl(url?: string | null): string {
  if (
    !url ||
    typeof url !== 'string' ||
    url.trim() === '' ||
    url === 'null' ||
    url === 'undefined'
  ) {
    return '/images/submariner-emerald.jpg';
  }

  // Chuẩn hóa dấu gạch chéo ngược trên Windows
  let clean = url.trim().replace(/\\/g, '/');

  // Ảnh tĩnh trong public/images
  if (clean.startsWith('/images/')) {
    return clean;
  }

  // Nếu đường dẫn chứa 'uploads/' (được upload từ backend)
  if (clean.includes('uploads/')) {
    const idx = clean.indexOf('uploads/');
    const uploadPath = clean.substring(idx);
    const backendBase =
      typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:5000`
        : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';
    return `${backendBase}/${uploadPath}`;
  }

  // Nếu đã là URL tuyệt đối bên ngoài (CDN, Imgur, Cloudinary)
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  if (clean.startsWith('/')) {
    return clean;
  }

  const backendBase =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:5000`
      : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5000';

  return `${backendBase}/${clean}`;
}

export function mapDbProductToWatchItem(p: any): WatchItem {
  // Tìm kiếm ảnh khả dụng:
  // 1. Kiểm tra p.imageUrl
  // 2. Kiểm tra mảng p.images
  // 3. Duyệt qua tất cả biến thể và mảng ảnh của biến thể
  let rawImage: string | null = null;

  if (p.imageUrl && typeof p.imageUrl === 'string' && p.imageUrl.trim() !== '' && p.imageUrl !== 'null') {
    rawImage = p.imageUrl;
  }

  if (!rawImage && Array.isArray(p.images) && p.images.length > 0) {
    for (const img of p.images) {
      const imgUrl = typeof img === 'string' ? img : img?.imageUrl;
      if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim() !== '' && imgUrl !== 'null') {
        rawImage = imgUrl;
        break;
      }
    }
  }

  if (!rawImage && Array.isArray(p.variants)) {
    for (const v of p.variants) {
      if (Array.isArray(v.images) && v.images.length > 0) {
        for (const img of v.images) {
          const imgUrl = typeof img === 'string' ? img : img?.imageUrl;
          if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim() !== '' && imgUrl !== 'null') {
            rawImage = imgUrl;
            break;
          }
        }
      }
      if (rawImage) break;
    }
  }

  // Nếu vẫn không có ảnh, dùng ảnh luxury placeholder
  if (!rawImage) {
    rawImage = '/images/submariner-emerald.jpg';
  }

  const mainImage = normalizeImageUrl(rawImage);

  // Thu thập toàn bộ gallery từ các biến thể
  const variantGallery = Array.isArray(p.variants)
    ? p.variants.flatMap((v: any) =>
        Array.isArray(v.images)
          ? v.images
              .map((img: any) => normalizeImageUrl(typeof img === 'string' ? img : img?.imageUrl))
              .filter(Boolean)
          : []
      )
    : [];

  const gallery =
    variantGallery.length > 0
      ? Array.from(new Set([mainImage, ...variantGallery]))
      : [mainImage];

  const defaultVariant = p.variants?.[0];
  const priceVND = defaultVariant?.price
    ? Number(defaultVariant.price)
    : Number(p.basePrice || 0);
  const priceUSD = Math.round(priceVND / 25000);

  // Ánh xạ toàn bộ danh sách phiên bản biến thể
  const mappedVariants: WatchVariant[] = Array.isArray(p.variants)
    ? p.variants.map((v: any) => {
        const variantPriceVND = v.price ? Number(v.price) : priceVND;
        const variantPriceUSD = Math.round(variantPriceVND / 25000);
        const vImagesList: string[] = [];
        if (v.imageUrl || v.image_url) {
          vImagesList.push(normalizeImageUrl(v.imageUrl || v.image_url));
        }
        if (Array.isArray(v.images)) {
          for (const img of v.images) {
            const rawUrl = typeof img === 'string' ? img : (img?.imageUrl || img?.image_url || img?.url);
            if (rawUrl) {
              vImagesList.push(normalizeImageUrl(rawUrl));
            }
          }
        }
        const vImages = Array.from(new Set(vImagesList.filter(Boolean)));

        // Đếm số lượng serial sẵn sàng giao dịch
        const stockCount = Array.isArray(v.serialNumbers)
          ? v.serialNumbers.filter((s: any) => s.status === 'available').length
          : 5;

        return {
          id: v.id,
          sku: v.sku || `BRU-${p.id}-${v.id}`,
          priceVND: variantPriceVND,
          priceUSD: variantPriceUSD,
          mauMatSo: v.mauMatSo || 'Mặt Số Cổ Điển',
          images: vImages.length > 0 ? vImages : [mainImage],
          stockCount,
        };
      })
    : [];

  // Định dạng tên cỗ máy
  const movementMap: Record<string, string> = {
    automatic: 'Cơ tự động lên dây (Automatic)',
    manual: 'Cơ lên cót tay (Manual Winding)',
    quartz: 'Điện tử chuẩn Thụy Sĩ (Quartz)',
    solar: 'Năng lượng ánh sáng (Solar)',
    smart: 'Cơ chế thông minh cao cấp',
  };
  const movement = movementMap[p.loaiBoMay] || 'Cơ tự động Thụy Sĩ (Automatic)';

  const primaryFeature = p.features?.[0]?.name;

  return {
    id: String(p.id),
    name: p.name,
    brand: p.brand?.name || 'BRU_WATCH Manufacture',
    series: p.brand?.name ? `${p.brand.name} Collection` : 'BRU_WATCH Exclusive',
    category: (p.category?.slug as any) || 'spotlight',
    priceUSD,
    priceVND,
    image: mainImage,
    gallery,
    tag: primaryFeature || (p.brand?.country ? `Xuất xứ ${p.brand.country}` : 'BRU_WATCH Tuyệt Tác'),
    isNew: true,
    isLimited: p.gender === 'unisex',
    rating: 5.0,
    reviewsCount: 18,
    variants: mappedVariants,
    warrantyMonths: p.warrantyMonths ? Number(p.warrantyMonths) : 24,
    gender: p.gender || 'unisex',
    features: Array.isArray(p.features) ? p.features : [],
    specs: {
      diameter: p.duongKinhMatSo ? `${p.duongKinhMatSo} mm` : '40.0 mm',
      thickness: p.beDayMatSo ? `${p.beDayMatSo} mm` : '11.5 mm',
      caseMaterial: p.chatLieuNieng || 'Thép không gỉ 316L Thụy Sĩ',
      bezel: p.chatLieuNieng || 'Niềng kim loại cao cấp',
      crystal: p.chatLieuKinh || 'Kính Sapphire nguyên khối chống lóa',
      movement,
      calibre: `Calibre In-House BRU_WATCH (${p.brand?.name || 'Swiss'})`,
      jewels: '28-31 Chân kính Ruby giảm ma sát',
      powerReserve: '70 giờ trữ cót tối đa',
      waterResistance: p.khaNangChongNuoc || '10 ATM (100m)',
      frequency: '28,800 vph (4 Hz)',
      strap: p.chatLieuDayDeo || p.Chat_Lieu_Day_Deo || 'Dây Thép Không Gỉ 316L',
      clasp: 'Khóa cài gập an toàn chống rơi',
    },
    description:
      p.description ||
      `${p.name} là mẫu đồng hồ cao cấp được chế tác theo tiêu chuẩn chất lượng khắt khe từ ${p.brand?.name || 'BRU_WATCH'}, mang lại phong cách sang trọng và đẳng cấp trường tồn.`,
    highlights:
      Array.isArray(p.features) && p.features.length > 0
        ? p.features.map((f: any) => f.name)
        : [
            'Kính Sapphire nguyên khối chống trầy xước tối đa',
            'Khung vỏ kim loại hoàn thiện chải xước thủ công',
            'Được kiểm định chống nước và lau dầu trước khi bàn giao',
          ],
  };
}
