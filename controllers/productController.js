import asyncHandler from 'express-async-handler';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getOfferProducts , searchProducts , autocompleteProducts, getProductCount, getOfferProductCount } from '../services/productService.js';
import { getCategoryById } from '../services/categoryService.js';
import  uploadToImgBB  from '../utils/uploadToImgBB.js';
// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const create = asyncHandler(async (req, res) => {
  const { name, price, discountedPrice, discountActive, category, stock, weight } = req.body;
// console.log(req.body);
  // Check if all required fields are provided
  if (!req.file) {
    return res.status(400).json({
      error: "Missing Asset (ملف مرفق مفقود)",
      message: "Product image is required (صورة المنتج مطلوبة)"
    });
  }

  if (!name || !price || !category) {
    return res.status(422).json({
      error: "Validation Failure (فشل التحقق)",
      message: "name, price, category are mandatory (الاسم، السعر، الفئة مطلوبة)"
    });
  }

  const existingCategory = await getCategoryById(category);
  if (!existingCategory) {
    return res.status(404).json({
      error: "Category Not Found (الفئة غير موجودة)",
      message: "The specified category does not exist (الفئة المحددة غير موجودة)"
    });
  }

  const img = await uploadToImgBB(req.file.buffer);

  try {
    const product = await createProduct(name, price, discountedPrice, discountActive, category, stock, img.url, weight);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get all products or products by category
// @route   GET /api/products or /api/products/category/:categoryId
// @access  Public
export const getAll = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    const products = await getProducts(categoryId, page, limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getById = asyncHandler(async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin

const parseFormData = (body) => {
    const updates = {};
  
    if (body.name) updates.name = body.name;
    if (body.price !== undefined && body.price !== "") updates.price = parseFloat(body.price);
    if (body.discountPrice !== undefined && body.discountPrice !== "") updates.discountPrice = parseFloat(body.discountPrice);
    if (body.stock !== undefined && body.stock !== "") updates.stock = parseInt(body.stock);
    if (body.discountActive === "true") updates.discountActive = true;
    if (body.discountActive === "false") updates.discountActive = false;
    if (body.category) updates.category = body.category;
    // if (body.description) updates.description = body.description;
    // if (body.brand) updates.brand = body.brand;
    if (body.weight !== undefined && body.weight !== "") updates.weight = parseFloat(body.weight);
  
    return updates;
  };
  
export const update = asyncHandler(async (req, res) => {
    const { id } = req.params;
  
    let updates = parseFormData(req.body);
  
    // رفع الصورة لو موجودة
    if (req.file) {
      const img = await uploadToImgBB(req.file.buffer);
      updates.image = img.url;
    }
  
    // تحديث المنتج
    const product = await updateProduct(id, updates);
  
    res.json({
      status: "Updated (تم التحديث)",
      data: product
    });
  });
  
  

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const remove = asyncHandler(async (req, res) => {
  try {
    const result = await deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get products on offer
// @route   GET /api/products/offers
// @access  Public
export const getOffers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const products = await getOfferProducts(page, limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const autocomplete = asyncHandler(async (req, res) => {
    const { keyword } = req.query;
    const { limit = 5 } = req.query;
  
    try {
      const results = await autocompleteProducts(keyword, parseInt(limit));
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });



  export const search = asyncHandler(async (req, res) => {
    const { keyword } = req.query;
    const { page = 1, limit = 10 } = req.query;
  
    try {
      const results = await searchProducts(keyword, parseInt(page), parseInt(limit));
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  export const getCount = asyncHandler(async (req, res) => {
    try {
      const count = await getProductCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  export const getOfferCount = asyncHandler(async (req, res) => {
    try {
      const count = await getOfferProductCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
