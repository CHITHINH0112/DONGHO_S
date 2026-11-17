/**
 * Tiện ích chuẩn hóa và xác thực số điện thoại di động Việt Nam thực tế
 * Định dạng: 10 chữ số, bắt đầu bằng số 0 và các đầu số di động chính thức của các nhà mạng:
 * - Viettel: 086, 096, 097, 098, 032, 033, 034, 035, 036, 037, 038, 039
 * - Mobifone: 089, 090, 093, 070, 079, 077, 076, 078
 * - Vinaphone: 088, 091, 094, 083, 084, 085, 081, 082
 * - Vietnamobile: 092, 056, 058
 * - Gmobile / Itelecom / Wintel: 099, 059, 087, 055, 052
 */

export const normalizeVietnamPhone = (phone: string): string => {
  if (!phone) return "";
  let cleaned = String(phone).trim().replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+84")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("84") && cleaned.length > 9) {
    cleaned = "0" + cleaned.slice(2);
  }
  return cleaned.replace(/\D/g, "");
};

export const isValidVietnamPhone = (phone: string): boolean => {
  const cleaned = normalizeVietnamPhone(phone);
  // Đúng 10 chữ số và bắt đầu bằng các đầu số di động hợp lệ tại Việt Nam
  const regex = /^(0)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
  return regex.test(cleaned);
};

export const getVietnamCarrierName = (phone: string): string | null => {
  const cleaned = normalizeVietnamPhone(phone);
  if (!isValidVietnamPhone(cleaned)) return null;

  const prefix3 = cleaned.slice(0, 3);
  if (["086", "096", "097", "098", "032", "033", "034", "035", "036", "037", "038", "039"].includes(prefix3)) {
    return "Viettel";
  }
  if (["089", "090", "093", "070", "079", "077", "076", "078"].includes(prefix3)) {
    return "MobiFone";
  }
  if (["088", "091", "094", "083", "084", "085", "081", "082"].includes(prefix3)) {
    return "VinaPhone";
  }
  if (["092", "056", "058"].includes(prefix3)) {
    return "Vietnamobile";
  }
  if (["099", "059"].includes(prefix3)) {
    return "Gmobile";
  }
  if (prefix3 === "087") return "iTel";
  if (prefix3 === "055") return "Wintel";

  return "Di động Việt Nam";
};

export default {
  normalizeVietnamPhone,
  isValidVietnamPhone,
  getVietnamCarrierName,
};

