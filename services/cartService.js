import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCartByUserId = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate('items.productId', 'name price image');
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  return cart;
};

export const addItemToCart = async (userId, productId, qtyParam) => {
  const qty = Number(qtyParam);
  const cart = await getCartByUserId(userId);
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  const itemIndex = cart.items.findIndex(item => item.productId._id.toString() === productId);

  if (itemIndex > -1) {
    // Product exists in cart, update quantity
    cart.items[itemIndex].qty += qty;
  } else {
    // Product does not exist in cart, add new item
    cart.items.push({ productId, qty, priceAtAdd: product.price });
  }

  await cart.save();
  return cart;
};

export const updateCartItemQuantity = async (userId, productId, qtyParam) => {
    const qty = Number(qtyParam);
    // console.log("updateCartItemQuantity" + userId + productId + qty);
  const cart = await getCartByUserId(userId);
//   console.log(cart);
  const itemIndex = cart.items.findIndex(item => item.productId._id.toString() === productId);
// console.log(itemIndex);
  if (itemIndex > -1) {
    cart.items[itemIndex].qty = qty;
    if (cart.items[itemIndex].qty <= 0) {
      cart.items.splice(itemIndex, 1);
    }
    await cart.save();
    return cart;
  } else {
    throw new Error('Item not found in cart');
  }
};

export const removeItemFromCart = async (userId, productId) => {
  const cart = await getCartByUserId(userId);
  cart.items = cart.items.filter(item => item.productId._id.toString() !== productId);
  await cart.save();
  return cart;
};