import asyncHandler from 'express-async-handler';
import { createOrder, getOrdersByUserId, getAllOrders, updateOrderStatus, deleteOrder } from '../services/orderService.js';

const processingOrders = new Set();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const create = asyncHandler(async (req, res) => {
  const { userId, address, phone } = req.body;

  if (!userId || !address || !phone) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  if (processingOrders.has(userId)) {
    res.status(409);
    throw new Error('Order creation already in progress for this user. Please wait.');
  }

  processingOrders.add(userId);

  try {
    const order = await createOrder(userId, address, phone);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    processingOrders.delete(userId);
  }
});

// @desc    Get orders for a user
// @route   GET /api/orders/:userId
// @access  Private
export const getByUserId = asyncHandler(async (req, res) => {
  try {
    const orders = await getOrdersByUserId(req.params.userId);
    res.json(orders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAll = asyncHandler(async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/status
// @access  Private/Admin
export const updateStatus = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body;

  try {
    const order = await updateOrderStatus(orderId, status);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete order (Admin only)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const remove = asyncHandler(async (req, res) => {
  try {
    const result = await deleteOrder(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});