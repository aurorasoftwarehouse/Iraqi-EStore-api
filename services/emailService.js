import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderConfirmationEmail = async (orderDetails) => {
    const { orderId, userInfo, address, total, itemsList, status } = orderDetails;
    const htmlStyle = `<div style="font-family:'Inter',sans-serif;max-width:620px;margin:auto;padding:36px;background:#fff;border-radius:18px;box-shadow:0 6px 18px rgba(0,0,0,0.06);">
  <!-- Header -->
  <div style="text-align:center;margin-bottom:34px;">
    <div style="width:58px;height:5px;margin:0 auto 14px;border-radius:3px;background:#0a84ff;"></div>
    <h1 style="font-size:32px;font-weight:700;color:#111;margin:0;">🛒 طلب جديد وصل</h1>
    <p style="font-size:14px;color:#777;margin-top:6px;">جاهز للعرض 👇</p>
  </div>

  <!-- Customer Details -->
  <section style="margin-bottom:28px;">
    <h2 style="font-size:19px;font-weight:600;color:#0a84ff;margin-bottom:12px;">معلومات الزبون</h2>
    <div style="padding:18px 22px;background:rgba(10,132,255,0.03);border:1px solid rgba(10,132,255,0.12);border-radius:14px;">
      <p style="margin:6px 0;font-size:16px;color:#222;">👤 الاسم: ${userInfo.name}</p>
      <p style="margin:6px 0;font-size:15px;color:#444;">📧 البريد: ${userInfo.email}</p>
      <p style="margin:6px 0;font-size:15px;color:#444;">📞 الهاتف: ${orderDetails.phone}</p>
    </div>
  </section>

  <!-- Order Summary -->
  <section style="margin-bottom:32px;">
    <h2 style="font-size:19px;font-weight:600;color:#0a84ff;margin-bottom:12px;">تفاصيل الطلب</h2>
    <div style="padding:18px 22px;background:#fafafa;border:1px solid #f0f0f0;border-radius:14px;">
      <div style="display:flex;justify-content:space-between;font-size:15px;color:#555;margin-bottom:8px;">
        <span>رقم الطلب</span><span>#${orderId}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:15px;margin-bottom:8px;">
  <span>الحالة</span>
  <span style="
    padding:4px 14px;
    border-radius:12px;
    font-size:14px;
    font-weight:600;
    color:#fff;
    background-color: ${status === 'pending' ? '#ffc107' :       // برتقالي فاتح → قيد الانتظار
                status === 'confirmed' ? '#0d6efd' :    // أزرق → مؤكد
                    status === 'shipped' ? '#17a2b8' :      // سماوي → تم الشحن
                        status === 'delivered' ? '#28a745' :    // أخضر → تم التوصيل
                            '#dc3545'                                // أحمر → ملغى
            };
  ">
    ${status === 'pending' ? 'قيد الانتظار' :
                status === 'confirmed' ? 'مؤكد' :
                    status === 'shipped' ? 'تم الشحن' :
                        status === 'delivered' ? 'تم التوصيل' :
                            'ملغى'
            }
  </span>
</div>

      <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:700;">
        <span>الإجمالي</span>
        <span style="color:#0a84ff;">$${total.toFixed(2)}</span>
      </div>
    </div>
  </section>

  <!-- Items -->
  <section>
    <h2 style="font-size:21px;font-weight:700;color:#111;margin-bottom:16px;">المنتجات المطلوبة</h2>
    <div>
      ${itemsList.map(item => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid #eee;">
          <div>
            <p style="margin:0;font-size:17px;font-weight:500;color:#222;">${item.name}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#888;">الكمية: ${item.qty}</p>
          </div>
          <p style="margin:0;font-size:16px;font-weight:700;color:#0a84ff;">$${item.priceAtOrder.toFixed(2)}</p>
        </div>
      `).join('')}
    </div>
  </section>

  <!-- Shipping -->
  <section style="margin-top:28px;">
    <h2 style="font-size:19px;font-weight:600;color:#0a84ff;margin-bottom:12px;">عنوان التوصيل</h2>
    <div style="padding:16px 20px;border:1px solid #eee;border-radius:14px;background:#fff;">
      <p style="margin:4px 0;font-size:15px;color:#444;">📍 ${address}</p>
    </div>
  </section>

  <!-- Footer -->
  <div style="text-align:center;margin-top:42px;">
    <div style="width:110px;height:1px;background:#ddd;margin:0 auto 14px;"></div>
    <p style="font-size:15px;font-weight:500;color:#444;margin:6px 0;">⚡ رجاءً تابع تنفيذ الطلب</p>
    <p style="font-size:12px;color:#aaa;margin:0;">شكراً الك</p>
  </div>

</div>`

    const mailOptions = {
        subject: `🚀🛒 طلب جديد جاهز للتنفيذ - من ${userInfo.name}`,
        html: htmlStyle ,
    };

    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'iraqeecomm@gmail.com',
        subject: mailOptions.subject,
        html: mailOptions.html,
    });
};