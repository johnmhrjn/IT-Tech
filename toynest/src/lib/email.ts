import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "ToyNest <orders@toynest.com.au>";

export async function sendOrderConfirmation(
  to: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number
) {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #f0f0f0">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right">A$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Order Confirmed – ${orderNumber} | ToyNest`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">ToyNest 🧸</h1>
        <h2 style="color:#1f2937;margin-top:0">Order Confirmed!</h2>
        <p style="color:#6b7280">Hi there! Your order <strong>${orderNumber}</strong> has been confirmed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#fef3c7">
              <th style="padding:8px;text-align:left">Item</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:8px;font-weight:bold">Total (incl. GST)</td>
              <td style="padding:8px;text-align:right;font-weight:bold;color:#f97316">A$${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        <p style="color:#6b7280;font-size:14px">You can track your order at <a href="${process.env.NEXT_PUBLIC_APP_URL}/track" style="color:#f97316">toynest.com.au/track</a></p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">ToyNest — Australia's favourite kids' toy store</p>
      </div>
    `,
  });
}

export async function sendShippingUpdate(
  to: string,
  orderNumber: string,
  trackingNumber: string,
  trackingUrl?: string
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your ToyNest order is on its way! – ${orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">ToyNest 🧸</h1>
        <h2 style="color:#1f2937">Your order has shipped!</h2>
        <p style="color:#6b7280">Order <strong>${orderNumber}</strong> is on its way.</p>
        <p><strong>Tracking number:</strong> ${trackingNumber}</p>
        ${trackingUrl ? `<a href="${trackingUrl}" style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px">Track your parcel</a>` : ""}
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">ToyNest — Australia's favourite kids' toy store</p>
      </div>
    `,
  });
}

export async function sendAbandonedCartEmail(
  to: string,
  name: string,
  items: Array<{ name: string; image: string; price: number }>
) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: "You left something behind! 🧸 | ToyNest",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#f97316;font-size:28px;margin-bottom:4px">ToyNest 🧸</h1>
        <h2 style="color:#1f2937">Hey ${name}, you forgot something!</h2>
        <p style="color:#6b7280">You left ${items.length} item${items.length > 1 ? "s" : ""} in your cart. They're waiting for you!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/cart" style="background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:16px 0">Return to Cart</a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">ToyNest — Australia's favourite kids' toy store</p>
      </div>
    `,
  });
}
