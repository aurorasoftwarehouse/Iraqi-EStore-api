import asyncHandler from 'express-async-handler';
import { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory } from '../services/categoryService.js';
import uploadToImgBB from '../utils/uploadToImgBB.js';

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const create = asyncHandler(async (req, res) => {
  const { name } = req.body;
  let image = null;

  if (req.file) {
    const uploadedImage = await uploadToImgBB(req.file.buffer);
    image = uploadedImage.url;
  }

  try {
    const category = await createCategory(name, image);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAll = asyncHandler(async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getById = asyncHandler(async (req, res) => {
  try {
    const category = await getCategoryById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const update = asyncHandler(async (req, res) => {
  const { name } = req.body;
  let image = null;

  if (req.file) {
    const uploadedImage = await uploadToImgBB(req.file.buffer);
    image = uploadedImage.url;
  }

  try {
    const category = await updateCategory(req.params.id, name, image);
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const remove = asyncHandler(async (req, res) => {
  try {
    const result = await deleteCategory(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});