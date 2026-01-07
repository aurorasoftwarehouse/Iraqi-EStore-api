import Category from '../models/Category.js';

export const createCategory = async (name, image) => {
  const category = new Category({ name, image });
  await category.save();
  return category;
};

export const getCategories = async () => {
  return await Category.find({});
};

export const getCategoryById = async (id) => {
  return await Category.findById(id);
};

export const updateCategory = async (id, name, image) => {
  const category = await Category.findById(id);
  if (category) {
    category.name = name || category.name;
    category.image = image || category.image;
    await category.save();
    return category;
  } else {
    throw new Error('Category not found');
  }
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (category) {
    await category.deleteOne();
    return { message: 'Category removed' };
  } else {
    throw new Error('Category not found');
  }
};