import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import { sendOrderConfirmationEmail } from './emailService.js';
import { sendNewOrderNotification } from './telegramService.js';

export const createOrder = async (userId, address, phone) => {
    if (!userId || !address || !phone) {
      throw new Error('Missing required fields (حقول مطلوبة ناقصة)');
    }
  
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart empty (السلة فاضية)');
    }
  
    // 1) التحقق من المخزون فقط للمنتجات اللي ليها stock
    for (const item of cart.items) {
      const product = item.productId;
      if (product.stock != null) { // Inventory tracked (المخزون متتبع)
        if (product.stock < item.qty) {
          throw new Error(`Insufficient stock (مخزون غير كافٍ) for ${product.name}`);
        }
      }
    }
  
    // 2) بناء عناصر الطلب من كل السلة
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      qty: item.qty,
      priceAtOrder: item.priceAtAdd,
    }));
  
    const total = cart.items.reduce((sum, item) => sum + Number(item.qty) * item.priceAtAdd, 0);
  
    const order = await Order.create({
      userId,
      items: orderItems,
      total,
      address,
      phone,
    });
  
    // 3) تقليل المخزون بشكل مجمع للمنتجات اللي ليها stock فقط
    const stockOps = cart.items
      .filter(item => item.productId.stock != null)
      .map(item => ({
        updateOne: {
          filter: { _id: item.productId._id },
          update: { $inc: { stock: -Number(item.qty) } }
        }
      }));
  
    if (stockOps.length > 0) {
      await Product.bulkWrite(stockOps);
    }
  
    // 4) إرسال الإشعارات
    const user = await User.findById(userId);
    const orderDetails = {
      orderId: order._id,
      userInfo: { name: user.username, email: user.email },
      address,
      phone,
      total,
      itemsList: orderItems,
      status: order.status,
    };
  
    await sendOrderConfirmationEmail(orderDetails);
    await sendNewOrderNotification(orderDetails);
  
    // 5) تفريغ السلة بعد إنشاء الطلب
    await Cart.updateOne({ userId }, { items: [] });
  
    return order;
  };
  

export const getOrdersByUserId = async (userId) => {
  return await Order.find({ userId }).populate('items.productId', 'name image');
};

export const getAllOrders = async () => {
  return await Order.find({}).populate('userId', 'name email').populate('items.productId', 'name image');
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  order.status = status;
  await order.save();
  return order;
};

export const deleteOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error('Order not found');
  }

  await order.deleteOne();
  return { message: 'Order removed' };
};