import Product from '../models/Product.js';

export const createProduct = async (name, price, discountedPrice, discountActive, category, stock, image, weight) => {
    // تحويل القيم الرقمية والـ boolean
    price = Number(price);
    discountedPrice = Number(discountedPrice);
    discountActive = discountActive === true || discountActive === "true"; // normalize boolean
    weight = weight ? Number(weight) : null;
    stock = stock ? Number(stock) : 0;
  
    if (price <= 0) {
      throw new Error("Price must be greater than 0");
    }
  
    let finalDiscountPercent = 0;
    let finalDiscountPrice = price;
  
    if (discountActive && discountedPrice < price) {
      const calc = ((price - discountedPrice) / price) * 100;
      finalDiscountPercent = Math.max(0, Number(calc.toFixed(2)));
      finalDiscountPrice = discountedPrice;
    } else {
      discountActive = false;
      finalDiscountPrice = price;
    }
  
    // console.log({
    //   price,
    //   discountedPrice,
    //   discountActive,
    //   finalDiscountPercent,
    //   finalDiscountPrice,
    // });
  
    const product = new Product({
      name,
      price,
      discountPercent: finalDiscountPercent,
      discountActive,
      discountPrice: finalDiscountPrice,
      category,
      stock,
      image,
      weight,
    });
  
    await product.save();
    return product;
  };
  
  

export const getProducts = async (categoryId = null, page = 1, limit = 10) => {
  const query = categoryId ? { category: categoryId } : {};
  const products = await Product.find(query)
    .populate('category') // Populate all category fields
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  const count = await Product.countDocuments(query);
  return { products, totalPages: Math.ceil(count / limit), currentPage: page };
};

export const getProductById = async (id) => {
  return await Product.findById(id).populate('category');
};

export const updateProduct = async (id, updates) => {
    // جلب المنتج الأصلي
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error("Product not found (المنتج غير موجود)");
      error.statusCode = 404;
      throw error;
    }
  
    // حذف أي قيمة undefined لتجنب مسح بيانات MongoDB بالخطأ
    Object.keys(updates).forEach(
      key => (updates[key] === undefined || updates[key] === '') && delete updates[key]
    );
  
    // حساب الخصم بشكل ديناميكي
    if (
      updates.price !== undefined ||
      updates.discountPrice !== undefined ||
      updates.discountActive !== undefined
    ) {
      const price = updates.price ?? product.price;
      const discountedPrice = updates.discountPrice ?? product.discountPrice ?? price;
      const discountActive = updates.discountActive ?? product.discountActive ?? false;
  
      if (discountActive && discountedPrice >= price) {
        console.warn(
          'Warning: discountActive is true but discountPrice is not less than price. Discount will be ignored.'
        );
      }
  
      // حساب نسبة الخصم
      updates.discountPercent = (discountActive && discountedPrice < price)
        ? parseFloat(((price - discountedPrice) / price * 100).toFixed(2))
        : 0;
  
      // ضبط الخصم والسعر بعد التحقق
      updates.discountPrice = (discountActive && discountedPrice < price) ? discountedPrice : price;
      updates.discountActive = discountActive && discountedPrice < price;
    }
  
    // تحديث المنتج بشكل Atomic وآمن
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
  
    if (!updatedProduct) {
      const error = new Error("Product not found after update (المنتج غير موجود بعد التحديث)");
      error.statusCode = 404;
      throw error;
    }
  
    return {
      status: "Success (نجاح)",
      event: "Product Updated (تم تحديث المنتج)",
      product: updatedProduct
    };
  };
  
export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (product) {
    await product.deleteOne();
    return { message: 'Product removed' };
  } else {
    throw new Error('Product not found');
  }
};

export const getOfferProducts = async (page = 1, limit = 10) => {
  const query = { discountActive: true, $expr: { $lt: ['$discountPrice', '$price'] } };
  const products = await Product.find(query)
    .populate('category') // Populate all category fields
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  const count = await Product.countDocuments(query);
  return { products, totalPages: Math.ceil(count / limit), currentPage: page };
};
// ==========================
// Search Products (منفصل)
// ==========================
export const searchProducts = async (keyword, page = 1, limit = 10) => {
    if (!keyword) return { products: [], totalPages: 0, currentPage: page };
  
    // البحث بالكلمة المفتاحية باستخدام Text Index
    const query = { $text: { $search: keyword } };
  
    // جلب المنتجات مع الحقول المهمة فقط
    const products = await Product.find(query, 'name price discountPrice discountPercent discountActive stock category image')
      .populate('category', 'name')
      .sort({ score: { $meta: 'textScore' } }) // ترتيب حسب التطابق مع البحث
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();
  
    // حساب السعر النهائي لكل منتج
    const productsWithFinalPrice = products.map(p => {
      let finalPrice = p.price;
      if (p.discountActive) {
        if (p.discountPrice != null) finalPrice = p.discountPrice;
        else if (p.discountPercent != null) finalPrice = p.price - (p.price * p.discountPercent / 100);
      }
      return { ...p, finalPrice };
    });
  
    const count = await Product.countDocuments(query);
  
    return { products: productsWithFinalPrice,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    };
  };
  
  export const getProductCount = async () => {
    return await Product.countDocuments();
  };

  export const getOfferProductCount = async () => {
    const query = { discountActive: true, $expr: { $lt: ['$discountPrice', '$price'] } };
    return await Product.countDocuments(query);
  };
  // ==========================
// Autocomplete Products
// ==========================
export const autocompleteProducts = async (keyword, limit = 5) => {
    if (!keyword) return [];
  
    const regex = new RegExp(`^${keyword}`, 'i'); // يبدأ بالكلمة المدخلة، case-insensitive
  
    const products = await Product.find(
      { name: regex },
      { name: 1, price: 1, discountPrice: 1, discountPercent: 1, discountActive: 1 } // جلب الحقول المهمة
    )
      .sort({ name: 1 }) // ترتيب أبجدي
      .limit(limit)
      .lean();
  
    return products.map(p => {
      let finalPrice = p.price;
      if (p.discountActive) {
        if (p.discountPrice != null) finalPrice = p.discountPrice;
        else if (p.discountPercent != null) finalPrice = p.price - (p.price * p.discountPercent / 100);
      }
  
      return {
        _id: p._id,
        name: p.name,
        finalPrice
      };
    });
  };
  