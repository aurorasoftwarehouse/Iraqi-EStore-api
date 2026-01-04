 import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

export const sendNewOrderNotification = async (orderDetails) => {
  const { orderId, userInfo, address, total, itemsList, status } = orderDetails;

  let message = `*New Order Received!*\n\n`;
  message += `*Order ID:* ${orderId}\n`;
  message += `*Customer:* ${userInfo.name} (${userInfo.email})\n`;
  message += `*Shipping Address:* ${address}\n`;
  message += `*Total:* $${total.toFixed(2)}\n`;
  message += `*Status:* ${status}\n\n`;
  message += `*Items:*\n`;
  itemsList.forEach(item => {
    message += `- ${item.name} (x${item.qty}) @ $${item.priceAtOrder.toFixed(2)} each\n`;
  });

  await bot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, message, { parse_mode: 'Markdown' });
};