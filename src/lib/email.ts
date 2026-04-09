import { Resend } from "resend";

// 延迟初始化，避免 build 时缺少 API key 报错
let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) return null;
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
const FROM_EMAIL = "東方點心 <orders@dongfangdimsim.com.au>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dongfangdimsim.com.au";

// 状态中文标签
const STATUS_LABELS: Record<string, string> = {
  PENDING: "待支付",
  PAID: "已支付",
  CONFIRMED: "已确认",
  PREPARING: "准备中",
  READY: "待取餐",
  DELIVERING: "配送中",
  DELIVERED: "已送达",
  CANCELLED: "已取消",
  REFUNDED: "已退款",
};

function emailLayout(content: string) {
  return `
<!DOCTYPE html>
<html lang="zh">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#c41e24;padding:24px 32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:2px;">東方點心</h1>
            <p style="margin:4px 0 0;color:#ffcccc;font-size:13px;">Dong Fang Dim Sim</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;color:#999;font-size:12px;">東方點心 Dong Fang Dim Sim</p>
            <p style="margin:4px 0 0;color:#bbb;font-size:11px;">此邮件为系统自动发送，请勿回复</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * 发送订单确认邮件
 */
export async function sendOrderConfirmation(
  to: string,
  orderNo: string,
  totalAmount: number,
  items: { name: string; quantity: number; price: number }[]
) {
  try {
    const itemRows = items
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">${item.name}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center;">x${item.quantity}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
          </tr>`
      )
      .join("");

    const html = emailLayout(`
      <h2 style="margin:0 0 8px;color:#333;font-size:20px;">订单已创建</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px;">您的订单已成功提交，请尽快完成支付。</p>

      <div style="background:#fafafa;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;color:#999;font-size:12px;">订单编号</p>
        <p style="margin:4px 0 0;color:#333;font-size:16px;font-weight:600;">${orderNo}</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr style="color:#999;font-size:12px;">
          <td style="padding:8px 0;border-bottom:2px solid #eee;">商品</td>
          <td style="padding:8px 0;border-bottom:2px solid #eee;text-align:center;">数量</td>
          <td style="padding:8px 0;border-bottom:2px solid #eee;text-align:right;">小计</td>
        </tr>
        ${itemRows}
      </table>

      <div style="text-align:right;margin-bottom:24px;">
        <span style="color:#666;font-size:14px;">合计：</span>
        <span style="color:#c41e24;font-size:20px;font-weight:700;">${formatPrice(totalAmount)}</span>
      </div>

      <div style="text-align:center;">
        <a href="${SITE_URL}/account/orders" style="display:inline-block;background:#c41e24;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">查看订单</a>
      </div>
    `);

    const resend = getResend();
    if (!resend) return;
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `订单确认 - ${orderNo}`,
      html,
    });
    console.log(`订单确认邮件已发送: ${orderNo} -> ${to}`);
  } catch (error) {
    console.error("发送订单确认邮件失败:", error);
  }
}

/**
 * 发送支付成功邮件
 */
export async function sendPaymentSuccess(
  to: string,
  orderNo: string,
  totalAmount: number
) {
  try {
    const html = emailLayout(`
      <h2 style="margin:0 0 8px;color:#333;font-size:20px;">✅ 支付成功</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px;">您的订单已支付成功，我们将尽快为您准备。</p>

      <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #bbf7d0;">
        <p style="margin:0;color:#999;font-size:12px;">订单编号</p>
        <p style="margin:4px 0 0;color:#333;font-size:16px;font-weight:600;">${orderNo}</p>
        <p style="margin:12px 0 0;color:#999;font-size:12px;">支付金额</p>
        <p style="margin:4px 0 0;color:#16a34a;font-size:20px;font-weight:700;">${formatPrice(totalAmount)}</p>
      </div>

      <div style="text-align:center;">
        <a href="${SITE_URL}/account/orders" style="display:inline-block;background:#c41e24;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">查看订单详情</a>
      </div>
    `);

    const resend = getResend();
    if (!resend) return;
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `支付成功 - ${orderNo}`,
      html,
    });
    console.log(`支付成功邮件已发送: ${orderNo} -> ${to}`);
  } catch (error) {
    console.error("发送支付成功邮件失败:", error);
  }
}

/**
 * 发送订单状态更新邮件
 */
export async function sendOrderStatusUpdate(
  to: string,
  orderNo: string,
  status: string,
  statusLabel?: string
) {
  try {
    const label = statusLabel || STATUS_LABELS[status] || status;

    const html = emailLayout(`
      <h2 style="margin:0 0 8px;color:#333;font-size:20px;">订单状态更新</h2>
      <p style="margin:0 0 24px;color:#666;font-size:14px;">您的订单状态已更新。</p>

      <div style="background:#fafafa;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;color:#999;font-size:12px;">订单编号</p>
        <p style="margin:4px 0 0;color:#333;font-size:16px;font-weight:600;">${orderNo}</p>
        <p style="margin:12px 0 0;color:#999;font-size:12px;">当前状态</p>
        <p style="margin:4px 0 0;color:#c41e24;font-size:18px;font-weight:700;">${label}</p>
      </div>

      <div style="text-align:center;">
        <a href="${SITE_URL}/account/orders" style="display:inline-block;background:#c41e24;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">查看订单详情</a>
      </div>
    `);

    const resend = getResend();
    if (!resend) return;
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `订单 ${orderNo} 状态更新 - ${label}`,
      html,
    });
    console.log(`订单状态更新邮件已发送: ${orderNo} [${label}] -> ${to}`);
  } catch (error) {
    console.error("发送订单状态更新邮件失败:", error);
  }
}
