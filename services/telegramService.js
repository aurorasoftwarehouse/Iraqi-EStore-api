import { Telegraf } from 'telegraf';
import StoreOwner from '../models/StoreOwner.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// تشغيل البوت
export const startTelegramBot = () => {
  bot.start((ctx) => {
    ctx.reply('🤖 هذا البوت مخصّص لإشعارات المتجر، أرسل كلمة المرور حتى يتم الربط.');
  });

  bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const text = ctx.message.text.trim();

    try {
      // جلب بيانات مالك المتجر الوحيد من DB
      const owner = await StoreOwner.findOne({});
      if (!owner) {
        return ctx.reply('❗ ماكو متجر مسجّل بالنظام.');
      }

      // Check if the chat is already linked 
      if (owner.ownerChatId === chatId) {
        // If already linked, and the message is not the password (to avoid re-linking attempts)
        if (!(await owner.matchPassword(text))) {
          ctx.reply('عزيزي، هذا البوت مخصص فقط لاستقبال إشعارات الطلبات الجديدة. إذا عندك أي استفسار أو تحتاج مساعدة، يرجى التواصل وي المطورين مباشرةً. شكراً لتفهمك.');
        } else {
          // If it's the correct password again from an already linked chat, just confirm it's linked.
          ctx.reply('✅ حسابك مربوط بالفعل بهذا البوت.');
        }
      } else {
        // If chat is NOT linked, try to link it with the password
        if (await owner.matchPassword(text)) {
          owner.ownerChatId = chatId;
          await owner.save();
          ctx.reply('✅ تم الربط بنجاح، من هسه الإشعارات توصلك  ملاحظة: هذا البوت مخصص فقط لاستقبال إشعارات الطلبات. لأي استفسارات أو إضافات أخرى، يرجى التواصل مع المطورين الكرام.');
          console.log('Store securely linked to chat:', chatId);
        } else {
          ctx.reply('⛔ كلمة المرور غلط، ما تم الربط.');
        }
      }
    } catch (err) {
      console.error('Link error:', err);
      ctx.reply('⚠️ صار خطأ بالسيرفر، حاول بعد شوي.');
    }
  });

  bot.launch();
  console.log('🚀 Telegram bot launched and polling...');
};

// إرسال إشعار لأي chatId
export const sendTelegramNotification = async (chatId, message) => {
  try {
    await bot.telegram.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    console.log(`Notification sent to chat ID ${chatId}`);
  } catch (error) {
    console.error(`Failed to send Telegram notification to ${chatId}:`, error);
  }
};

// إرسال إشعار الطلب الجديد للمالك الوحيد فقط (بدون storeId)
export const sendNewOrderNotification = async (orderDetails) => {
  const { orderId, userInfo, address, total, itemsList, status } = orderDetails;

  let message = `🛒 *طلب جديد وصل!* 🛒\n\n`;
  message += `🆔 *رقم الطلب:* ${orderId}\n`;
  message += `👤 *اسم الزبون:* ${userInfo.name}\n`;
  message += `✉️ *بريد الزبون:* ${userInfo.email}\n`;
  message += `📦 *العنوان:* ${address}\n`;
  message += `💰 *المجموع الكلي:* $${total.toFixed(2)}\n`;
  message += `📌 *حالة الطلب:* ${status}\n\n`;

  message += `🛍️ *تفاصيل الأغراض:*\n`;
  message += `━━━━━━━━━━━━━━\n`;

  itemsList.forEach((item, index) => {
    const itemTotal = item.qty * item.priceAtOrder;
    message += `🔹 ${index + 1}) *${item.name}*\n`;
    message += `   ▫️ *الكمية:* ${item.qty}\n`;
    message += `   ▫️ *سعر الوحدة:* $${item.priceAtOrder.toFixed(2)}\n`;
    message += `   ▫️ *الإجمالي:* $${itemTotal.toFixed(2)}\n`;
    message += `━━━━━━━━━━━━━━\n`;
  });

  message += `\n📬 راجع الداشبورد إذا تحب تشوف كل التفاصيل.`;

  try {
    // جلب المالك الوحيد من DB (مصدر الحقيقة)
    const owner = await StoreOwner.findOne({});
    if (owner?.ownerChatId) {
      await sendTelegramNotification(owner.ownerChatId, message);
    } else {
      console.log('❗ ماكو chat مربوط، ما انبعت الإشعارات.');
    }
  } catch (err) {
    console.error('Notification error:', err);
  }
};
