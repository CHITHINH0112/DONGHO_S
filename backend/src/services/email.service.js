import nodemailer from 'nodemailer';

let transporterPromise = null;

/**
 * Khởi tạo transporter Nodemailer linh hoạt
 * Hỗ trợ Gmail / SMTP thật nếu có cấu hình trong .env, hoặc tự động kích hoạt Test Ethereal Account
 */
const getTransporter = async () => {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      console.log(`[Email Service] Sử dụng SMTP Transporter với tài khoản: ${emailUser}`);
      return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });
    }

    // Nếu chưa cấu hình SMTP thật, sử dụng Ethereal Test Account cho môi trường Development
    try {
      console.log('[Email Service] Không có EMAIL_USER/EMAIL_PASS trong .env. Khởi tạo Ethereal Test SMTP sandbox...');
      const testAccount = await nodemailer.createTestAccount();
      console.log(`[Email Service] Ethereal Test Account tạo thành công: ${testAccount.user}`);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn('[Email Service] Không thể tạo Ethereal Test Account, kích hoạt Mock Transport:', err.message);
      return {
        sendMail: async (mailOptions) => {
          console.log('\n=================== [MOCK EMAIL DISPATCHED] ===================');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log('===============================================================\n');
          return { messageId: `mock-${Date.now()}` };
        },
      };
    }
  })();

  return transporterPromise;
};

const formatVND = (amount) => {
  const num = Number(amount) || 0;
  return `${new Intl.NumberFormat('vi-VN').format(num)} ₫`;
};

/**
 * 1. Gửi email xác nhận đơn hàng khi khách hàng mua hàng thành công
 */
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const recipientEmail =
      order.user?.email ||
      order.address?.email ||
      (order.userId ? (await import('../models/index.js')).User.findByPk(order.userId).then((u) => u?.email) : null);

    if (!recipientEmail) {
      console.warn(`[Email Service] Đơn hàng #${order.orderCode} không tìm thấy địa chỉ email người nhận.`);
      return null;
    }

    const customerName = order.address?.receiverName || order.user?.name || 'Quý Khách';
    const carrier = order.shipment?.tenHangGiao || 'Giao Hàng Nhanh (GHN Express)';
    const trackingCode = order.shipment?.trackingCode || `GHN-LUX-${order.id}`;
    const shippingFee = Number(order.shipment?.shippingFee || 0);

    const itemsHtml = (order.items || [])
      .map((item) => {
        const v = item.variant;
        const prod = v?.product;
        const name = prod?.name || 'Đồng Hồ Cơ Khí Chế Tác';
        const dial = v?.mauMatSo ? `Mặt số: ${v.mauMatSo}` : 'Chế tác nguyên bản';
        const serial = item.serials?.[0]?.serialNumber || `SN-${order.id}-${item.id}`;
        const price = Number(item.giaSanPhamTaiLucDo || v?.price || 0);

        return `
          <tr style="border-bottom: 1px solid #233428;">
            <td style="padding: 14px 10px; font-family: 'Times New Roman', serif; font-size: 14px; color: #f5f5f5;">
              <strong style="color: #ffffff; display: block; font-size: 15px;">${name}</strong>
              <span style="font-size: 12px; color: #a3a3a3; font-family: monospace;">${dial} • SL: ${item.quantity}</span>
              <span style="display: block; font-size: 11px; color: #d4af37; font-family: monospace; margin-top: 4px;">Serial: <strong>${serial}</strong></span>
            </td>
            <td style="padding: 14px 10px; text-align: right; font-family: monospace; font-size: 14px; color: #d4af37; white-space: nowrap;">
              ${formatVND(price * item.quantity)}
            </td>
          </tr>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Xác Nhận Đơn Hàng BRU_WATCH</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #030805; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: 30px auto; background-color: #08120d; border: 1px solid #d4af37; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
          <!-- Header -->
          <tr>
            <td style="padding: 35px 30px; text-align: center; background: linear-gradient(180deg, #0d1e15 0%, #08120d 100%); border-bottom: 1px solid #d4af37;">
              <span style="font-family: monospace; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #d4af37; display: block; margin-bottom: 6px;">
                HAUTE HORLOGERIE BOUTIQUE • GENÈVE
              </span>
              <h1 style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 26px; font-weight: normal; letter-spacing: 0.1em; color: #ffffff;">
                BRU_WATCH BOUTIQUE
              </h1>
              <p style="margin: 8px 0 0; font-size: 12px; color: #a3a3a3; font-family: monospace;">
                Chứng Thư Tiếp Nhận Đơn Hàng Bàn Giao Niêm Phong
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 14px; line-height: 1.6; color: #d5d5d5; margin-top: 0;">
                Kính gửi <strong style="color: #ffffff;">${customerName}</strong>,
              </p>
              <p style="font-size: 13px; line-height: 1.6; color: #a3a3a3;">
                Chúng tôi xin trân trọng thông báo cỗ máy thời gian Quý khách vừa lựa chọn đã được tiếp nhận thành công. Bộ phận Chế tác & Giám định đang hoàn tất quy trình niêm phong an ninh trước khi bàn giao hỏa tốc đến tư gia.
              </p>

              <!-- Order Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050b07; border: 1px solid #233428; border-radius: 12px; margin: 20px 0; padding: 15px;">
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Mã Đơn Hàng:</td>
                  <td style="padding: 6px 10px; font-size: 13px; color: #d4af37; font-family: monospace; font-weight: bold; text-align: right;">#${order.orderCode}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Thời Gian Giao Dịch:</td>
                  <td style="padding: 6px 10px; font-size: 12px; color: #e5e5e5; font-family: monospace; text-align: right;">${new Date().toLocaleString('vi-VN')}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Phương Thức:</td>
                  <td style="padding: 6px 10px; font-size: 12px; color: #e5e5e5; font-family: monospace; text-align: right; text-transform: uppercase;">${order.paymentMethod === 'vnpay' ? 'Cổng VNPay' : order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản VietQR' : 'Bàn giao thu tiền (COD)'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Vận Đơn GHN Express:</td>
                  <td style="padding: 6px 10px; font-size: 13px; color: #34d399; font-family: monospace; font-weight: bold; text-align: right;">${trackingCode}</td>
                </tr>
              </table>

              <!-- Items Table -->
              <h3 style="font-family: 'Times New Roman', serif; font-size: 16px; color: #ffffff; margin: 25px 0 10px; border-bottom: 1px solid #d4af37; padding-bottom: 6px;">
                Danh Sách Cỗ Máy Thời Gian
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                ${itemsHtml}
              </table>

              <!-- Financial Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050b07; border-top: 1px solid #d4af37; padding-top: 15px; margin-top: 15px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888888; font-family: monospace;">Giá trị cỗ máy:</td>
                  <td style="padding: 4px 0; font-size: 12px; color: #e5e5e5; font-family: monospace; text-align: right;">${formatVND(order.tongTienBanDau)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888888; font-family: monospace;">Cước vận chuyển GHN:</td>
                  <td style="padding: 4px 0; font-size: 12px; color: #34d399; font-family: monospace; text-align: right;">${shippingFee === 0 ? 'Miễn Phí' : formatVND(shippingFee)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 12px; color: #888888; font-family: monospace;">Bảo hiểm rủi ro vận chuyển:</td>
                  <td style="padding: 4px 0; font-size: 12px; color: #34d399; font-family: monospace; text-align: right;">0 VNĐ (Tài trợ 100%)</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0; font-size: 15px; color: #ffffff; font-family: 'Times New Roman', serif;">Tổng thanh toán:</td>
                  <td style="padding: 12px 0 0; font-size: 18px; color: #d4af37; font-family: 'Times New Roman', serif; font-weight: bold; text-align: right;">${formatVND(order.tongTienDonHang)}</td>
                </tr>
              </table>

              <!-- Delivery Address Notice -->
              <div style="margin-top: 25px; padding: 15px; background-color: #0d1e15; border-radius: 10px; border-left: 3px solid #d4af37;">
                <span style="display: block; font-size: 11px; font-family: monospace; color: #d4af37; text-transform: uppercase;">Địa Chỉ Bàn Giao Niêm Phong:</span>
                <p style="margin: 4px 0 0; font-size: 12px; color: #e5e5e5; line-height: 1.5;">
                  <strong>${order.address?.receiverName || customerName}</strong> (${order.address?.phone || 'Chưa cập nhật'})<br>
                  ${order.address?.address || 'Bàn giao trực tiếp tại Flagship Boutique'}
                </p>
                <span style="display: block; font-size: 11px; color: #34d399; margin-top: 6px;">* Dịch vụ niêm phong & đồng kiểm bưu kiện lúc nhận hàng theo tiêu chuẩn GHN Express.</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 25px 30px; text-align: center; background-color: #040906; border-top: 1px solid #1a2a20;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #888888; font-family: monospace;">
                BRU_WATCH HAUTE HORLOGERIE FLAGSHIP BOUTIQUE
              </p>
              <p style="margin: 0; font-size: 10px; color: #555555; font-family: monospace;">
                Địa chỉ: 1 Lê Duẩn, Bến Nghé, Quận 1, TP. Hồ Chí Minh • Hotline VIP: 1900 88 99 22
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const transporter = await getTransporter();
    const mailOptions = {
      from: `"BRU_WATCH Haute Horlogerie" <${process.env.EMAIL_USER || 'concierge@bruwatch.geneve.ch'}>`,
      to: recipientEmail,
      subject: `[BRU_WATCH Boutique] Xác Nhận Đơn Hàng #${order.orderCode} - Bàn Giao Niêm Phong Thụy Sĩ`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Đã gửi email xác nhận đơn hàng #${order.orderCode} tới ${recipientEmail}. MessageId: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Service] Xem trước Email đơn hàng (Preview URL): ${previewUrl}`);
      }
    }
    return info;
  } catch (error) {
    console.warn(`[Email Service] Lỗi khi gửi email xác nhận đơn hàng #${order.orderCode}:`, error.message);
    return null;
  }
};

/**
 * 2. Gửi email xác nhận đặt lịch hẹn bảo dưỡng & dịch vụ kỹ thuật
 */
export const sendServiceBookingEmail = async (ticket, fallbackEmail = null) => {
  try {
    const recipientEmail =
      fallbackEmail ||
      ticket.customer?.email ||
      (ticket.customerId ? (await import('../models/index.js')).User.findByPk(ticket.customerId).then((u) => u?.email) : null);

    if (!recipientEmail) {
      console.warn(`[Email Service] Phiếu dịch vụ #${ticket.id} không tìm thấy địa chỉ email khách hàng.`);
      return null;
    }

    const customerName = ticket.customer?.name || 'Quý Khách';
    const serviceName = ticket.service?.name || 'Bảo Dưỡng Cỗ Máy Thụy Sĩ';
    const serialText = ticket.serialNumber?.serialNumber || ticket.note?.match(/Serial:\s*([^\s•,]+)/)?.[1] || 'Cỗ Máy Định Danh VIP';
    const appointmentDateText = ticket.appointmentDate
      ? new Date(ticket.appointmentDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Trong vòng 24 giờ tới';

    const pickupMatch = ticket.note?.match(/Tiếp nhận tận nơi:\s*([^•]+)/);
    const locationText = pickupMatch ? pickupMatch[1].trim() : 'Flagship Boutique (1 Lê Duẩn, Quận 1, TP.HCM)';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Tiếp Nhận Lịch Hẹn Dịch Vụ BRU_WATCH</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #030805; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e5e5;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: 30px auto; background-color: #08120d; border: 1px solid #d4af37; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
          <!-- Header -->
          <tr>
            <td style="padding: 35px 30px; text-align: center; background: linear-gradient(180deg, #0d1e15 0%, #08120d 100%); border-bottom: 1px solid #d4af37;">
              <span style="font-family: monospace; font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; color: #d4af37; display: block; margin-bottom: 6px;">
                HAUTE HORLOGERIE ATELIER • GENÈVE STANDARDS
              </span>
              <h1 style="margin: 0; font-family: 'Times New Roman', Georgia, serif; font-size: 26px; font-weight: normal; letter-spacing: 0.1em; color: #ffffff;">
                BRU_WATCH ATELIER
              </h1>
              <p style="margin: 8px 0 0; font-size: 12px; color: #a3a3a3; font-family: monospace;">
                Phiếu Tiếp Nhận Lịch Hẹn Kỹ Thuật & Bảo Dưỡng Định Kỳ
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px;">
              <p style="font-size: 14px; line-height: 1.6; color: #d5d5d5; margin-top: 0;">
                Kính gửi <strong style="color: #ffffff;">${customerName}</strong>,
              </p>
              <p style="font-size: 13px; line-height: 1.6; color: #a3a3a3;">
                Chúng tôi đã ghi nhận yêu cầu bảo dưỡng / kỹ thuật cho cỗ máy thời gian của Quý khách. Trưởng bộ phận Vi cơ học sẽ chủ động liên hệ trực tiếp trong vòng 30 phút để chuẩn bị đón nhận cỗ máy tại Salon hoặc cử chuyên viên bảo an đến tư gia.
              </p>

              <!-- Ticket Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050b07; border: 1px solid #233428; border-radius: 12px; margin: 20px 0; padding: 18px;">
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Mã Phiếu Dịch Vụ:</td>
                  <td style="padding: 6px 10px; font-size: 13px; color: #d4af37; font-family: monospace; font-weight: bold; text-align: right;">#TK-${ticket.id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Gói Chăm Sóc:</td>
                  <td style="padding: 6px 10px; font-size: 13px; color: #ffffff; font-family: 'Times New Roman', serif; text-align: right; font-weight: bold;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Số Serial / Cỗ Máy:</td>
                  <td style="padding: 6px 10px; font-size: 13px; color: #d4af37; font-family: monospace; text-align: right;">${serialText}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Ngày Dự Kiến Tiếp Nhận:</td>
                  <td style="padding: 6px 10px; font-size: 13px; color: #34d399; font-family: monospace; text-align: right;">${appointmentDateText}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Địa Điểm Tiếp Nhận:</td>
                  <td style="padding: 6px 10px; font-size: 12px; color: #e5e5e5; font-family: sans-serif; text-align: right;">${locationText}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Chi Phí Dự Kiến:</td>
                  <td style="padding: 6px 10px; font-size: 14px; color: #d4af37; font-family: monospace; font-weight: bold; text-align: right;">${Number(ticket.cost) === 0 ? 'Miễn Phí Theo Bảo Hành' : formatVND(ticket.cost)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 10px; font-size: 12px; color: #888888; font-family: monospace;">Mô Tả / Yêu Cầu Riêng:</td>
                  <td style="padding: 6px 10px; font-size: 12px; color: #e5e5e5; text-align: right; font-family: sans-serif;">${ticket.issueDescription || 'Bảo dưỡng tiêu chuẩn Thụy Sĩ'}</td>
                </tr>
              </table>

              <!-- Commitment Box -->
              <div style="margin-top: 20px; padding: 15px; background-color: #0d1e15; border-radius: 10px; border-left: 3px solid #34d399;">
                <span style="display: block; font-size: 11px; font-family: monospace; color: #34d399; text-transform: uppercase;">Cam Kết Chuẩn Thụy Sĩ:</span>
                <p style="margin: 4px 0 0; font-size: 12px; color: #e5e5e5; line-height: 1.5;">
                  Mọi thao tác đều được thực hiện trong buồng kháng bụi tiêu chuẩn ISO, dung dịch tẩy rửa siêu âm chuyên dụng và dầu bôi trơn Moebius nhập khẩu Thụy Sĩ. Cấp chứng nhận kiểm định sau khi hoàn thiện.
                </p>
              </div>

              <p style="font-size: 12px; color: #888888; margin-top: 25px; line-height: 1.5;">
                Quý khách có thể theo dõi tiến độ thẩm định và phục chế cỗ máy thời gian bất kỳ lúc nào tại mục <strong>"Lịch Hẹn Dịch Vụ"</strong> trong tài khoản hội viên BRU_WATCH.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 25px 30px; text-align: center; background-color: #040906; border-top: 1px solid #1a2a20;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #888888; font-family: monospace;">
                BRU_WATCH HAUTE HORLOGERIE ATELIER
              </p>
              <p style="margin: 0; font-size: 10px; color: #555555; font-family: monospace;">
                Phòng Chế Tác Vi Cơ Học • Hotline Kỹ Thuật VIP: 1900 88 99 22
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const transporter = await getTransporter();
    const mailOptions = {
      from: `"BRU_WATCH Atelier" <${process.env.EMAIL_USER || 'atelier@bruwatch.geneve.ch'}>`,
      to: recipientEmail,
      subject: `[BRU_WATCH Atelier] Tiếp Nhận Lịch Hẹn Dịch Vụ Cỗ Máy #${ticket.id}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Đã gửi email xác nhận lịch hẹn dịch vụ #${ticket.id} tới ${recipientEmail}. MessageId: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Service] Xem trước Email lịch hẹn (Preview URL): ${previewUrl}`);
      }
    }
    return info;
  } catch (error) {
    console.warn(`[Email Service] Lỗi khi gửi email xác nhận lịch hẹn dịch vụ #${ticket.id}:`, error.message);
    return null;
  }
};

export default {
  sendOrderConfirmationEmail,
  sendServiceBookingEmail,
};

