# API Documentation for Products and Categories

This document outlines the API endpoints for managing products and categories, including examples for frontend integration using `axios` and `fetch`.

## Base URL
### https://iraqi-e-store-api.vercel.app/

## Authentication

Most endpoints require authentication. For web applications, the authentication token is typically stored in cookies. For other clients, ensure you include the authentication token in the `Authorization` header as a Bearer token.

**For Web (Token in Cookies):**

When making requests from a web browser, the authentication token is usually sent automatically via cookies after a successful login. Ensure your `axios` or `fetch` calls include `withCredentials: true` (for axios) or `credentials: 'include'` (for fetch) to send cookies.

**Example with `axios` (for web):**

```javascript
import axios from 'axios';

const config = {
  withCredentials: true, // Important for sending cookies
  headers: {
    'Content-Type': 'application/json' // For JSON payloads
  }
};
```

**Example with `fetch` (for web):**

```javascript
const config = {
  credentials: 'include', // Important for sending cookies
  headers: {
    'Content-Type': 'application/json' // For JSON payloads
  }
};
```
---

## Product Endpoints

### 1. Create a New Product

- **URL:** `/api/products`
- **Method:** `POST`
- **Access:** Private/Admin
- **Description:** Creates a new product. Requires `name`, `price`, and `category`. An `image` file is also required.

**Request Body (multipart/form-data):**

| Field          | Type    | Required | Description                               |
| :------------- | :------ | :------- | :---------------------------------------- |
| `name`         | String  | Yes      | Name of the product                       |
| `price`        | Number  | Yes      | Price of the product                      |
| `discountedPrice` | Number  | No       | Discounted price (if applicable)          |
| `discountActive` | Boolean | No       | Whether discount is active (send as "true" or "false" string) |
| `category`     | String  | Yes      | Category ID                               |
| `stock`        | Number  | No       | Stock quantity                            |
| `image`        | File    | Yes      | Product image (field name must be 'image')|
| `weights`      | text   | No       | Weights (if applicable)                    |
**Example with `axios`:**

```javascript
import axios from 'axios';

const createProduct = async (productData, imageFile) => {
  const formData = new FormData();
  for (const key in productData) {
    formData.append(key, productData[key]);
  }
  formData.append('image', imageFile); // 'image' must match Multer's expected field name

  try {
    const config = {
      withCredentials: true, // Important for sending cookies
      headers: {
        // 'Content-Type': 'multipart/form-data' is automatically set by browser for FormData
      },
    };
    const response = await axios.post('http://localhost:3000/api/products', formData, config);
    console.log('Product created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Usage example:
const newProductData = {
  name: 'Example Product',
  price: 100,
  discountedPrice: 80,
  discountActive: 'true', // Send as string
  category: '60d5ec49f8c7b00015f6e4a1', // Replace with actual category ID
  stock: 50,
  weights: '100g, 200g, 300g'
};
const imageInput = document.querySelector('#productImage'); // Assuming an input type="file" with id="productImage"
const imageFile = imageInput.files[0];

if (imageFile) {
  createProduct(newProductData, imageFile);
} else {
  console.error('Please select an image file.');
}
```

**Example with `fetch`:**

```javascript
const createProductFetch = async (productData, imageFile) => {
  const formData = new FormData();
  for (const key in productData) {
    formData.append(key, productData[key]);
  }
  formData.append('image', imageFile);

  try {
    const token = 'YOUR_AUTH_TOKEN';
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      credentials: 'include', // Important for sending cookies
      headers: {
        // 'Content-Type' is automatically set by browser for FormData
      },
    });
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create product');
    }
    console.log('Product created:', data);
    return data;
  } catch (error) {
    console.error('Error creating product:', error.message);
    throw error;
  }
};

// Usage example (same as axios):
// const newProductData = { ... };
// const imageInput = document.querySelector('#productImage');
// const imageFile = imageInput.files[0];
// if (imageFile) { createProductFetch(newProductData, imageFile); }
```

### 2. Get All Products

- **URL:** `/api/products`
- **Method:** `GET`
- **Access:** Public
- **Description:** Retrieves all products. Supports pagination.

**Query Parameters:**

| Field   | Type   | Default | Description             |
| :------ | :----- | :------ | :---------------------- |
| `page`  | Number | 1       | Page number             |
| `limit` | Number | 10      | Number of items per page|

**Example with `axios`:**

```javascript
import axios from 'axios';

const getAllProducts = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/products?page=${page}&limit=${limit}`);
    console.log('All products:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error.response ? error.response.data : error.message);
    throw error;
  }
};

getAllProducts();
```

**Example with `fetch`:**

```javascript
const getAllProductsFetch = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`http://localhost:3000/api/products?page=${page}&limit=${limit}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch products');
    }
    console.log('All products:', data);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

getAllProductsFetch();
```

### 3. Get Products by Category

- **URL:** `/api/products/category/:categoryId`
- **Method:** `GET`
- **Access:** Public
- **Description:** Retrieves products belonging to a specific category. Supports pagination.

**Path Parameters:**

| Field        | Type   | Description     |
| :----------- | :----- | :-------------- |
| `categoryId` | String | ID of the category|

**Query Parameters:**

| Field   | Type   | Default | Description             |
| :------ | :----- | :------ | :---------------------- |
| `page`  | Number | 1       | Page number             |
| `limit` | Number | 10      | Number of items per page|

**Example with `axios`:**

```javascript
import axios from 'axios';

const getProductsByCategory = async (categoryId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/products/category/${categoryId}?page=${page}&limit=${limit}`);
    console.log(`Products in category ${categoryId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error.response ? error.response.data : error.message);
    throw error;
  }
};

getProductsByCategory('60d5ec49f8c7b00015f6e4a1'); // Replace with actual category ID
```

**Example with `fetch`:**

```javascript
const getProductsByCategoryFetch = async (categoryId, page = 1, limit = 10) => {
  try {
    const response = await fetch(`http://localhost:3000/api/products/category/${categoryId}?page=${page}&limit=${limit}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch products by category');
    }
    console.log(`Products in category ${categoryId}:`, data);
    return data;
  } catch (error) {
    console.error('Error fetching products by category:', error.message);
    throw error;
  }
};

getProductsByCategoryFetch('60d5ec49f8c7b00015f6e4a1');
```

### 4. Get Product by ID

- **URL:** `/api/products/:id`
- **Method:** `GET`
- **Access:** Public
- **Description:** Retrieves a single product by its ID.

**Path Parameters:**

| Field | Type   | Description   |
| :---- | :----- | :------------ |
| `id`  | String | ID of the product|

**Example with `axios`:**

```javascript
import axios from 'axios';

const getProductById = async (productId) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/products/${productId}`);
    console.log('Product by ID:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching product by ID:', error.response ? error.response.data : error.message);
    throw error;
  }
};

getProductById('60d5ec49f8c7b00015f6e4a2'); // Replace with actual product ID
```

**Example with `fetch`:**

```javascript
const getProductByIdFetch = async (productId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch product by ID');
    }
    console.log('Product by ID:', data);
    return data;
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    throw error;
  }
};

getProductByIdFetch('60d5ec49f8c7b00015f6e4a2');
```

### 5. Update a Product

- **URL:** `/api/products/:id`
- **Method:** `PUT`
- **Access:** Private/Admin
- **Description:** Updates an existing product. Can update any field, including the image.

**Path Parameters:**

| Field | Type   | Description   |
| :---- | :----- | :------------ |
| `id`  | String | ID of the product|

**Request Body (multipart/form-data or application/json):**

Can include any of the fields from the "Create Product" section. If updating the image, send `multipart/form-data` with the new `image` file. If only updating other fields, `application/json` can be used.

**Example with `axios` (updating image and other fields):**

```javascript
import axios from 'axios';

const updateProduct = async (productId, updatedData, imageFile) => {
  const formData = new FormData();
  for (const key in updatedData) {
    formData.append(key, updatedData[key]);
  }
  if (imageFile) {
    formData.append('image', imageFile);
  }

  try {
    const token = 'YOUR_AUTH_TOKEN';
    const config = {
      withCredentials: true, // Important for sending cookies
      headers: {},
    };
    const response = await axios.put(`http://localhost:3000/api/products/${productId}`, formData, config);
    console.log('Product updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Usage example:
const productIdToUpdate = '60d5ec49f8c7b00015f6e4a2'; // Replace with actual product ID
const updatedProductData = {
  name: 'Updated Product Name',
  price: 120,
  discountActive: 'false',
  // ... other fields to update
};
const newImageInput = document.querySelector('#newProductImage');
const newImageFile = newImageInput ? newImageInput.files[0] : null;

updateProduct(productIdToUpdate, updatedProductData, newImageFile);
```

**Example with `axios` (updating only JSON fields):**

```javascript
import axios from 'axios';

const updateProductJson = async (productId, updatedData) => {
  try {
    const token = 'YOUR_AUTH_TOKEN';
    const config = {
      withCredentials: true, // Important for sending cookies
      headers: {
        'Content-Type': 'application/json'
      },
    };
    const response = await axios.put(`http://localhost:3000/api/products/${productId}`, updatedData, config);
    console.log('Product updated (JSON):', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating product (JSON):', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Usage example:
const productIdToUpdate = '60d5ec49f8c7b00015f6e4a2';
const updatedProductDataJson = {
  name: 'Updated Product Name Only',
  stock: 75,
};

updateProductJson(productIdToUpdate, updatedProductDataJson);
```

**Example with `fetch` (updating image and other fields):**

```javascript
const updateProductFetch = async (productId, updatedData, imageFile) => {
  const formData = new FormData();
  for (const key in updatedData) {
    formData.append(key, updatedData[key]);
  }
  if (imageFile) {
    formData.append('image', imageFile);
  }

  try {
    const token = 'YOUR_AUTH_TOKEN';
    const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'PUT',
      credentials: 'include', // Important for sending cookies
      headers: {
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product');
    }
    console.log('Product updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating product:', error.message);
    throw error;
  }
};

// Usage example (same as axios):
// const productIdToUpdate = '60d5ec49f8c7b00015f6e4a2';
// const updatedProductData = { ... };
// const newImageInput = document.querySelector('#newProductImage');
// const newImageFile = newImageInput ? newImageInput.files[0] : null;
// updateProductFetch(productIdToUpdate, updatedProductData, newImageFile);
```

**Example with `fetch` (updating only JSON fields):**

```javascript
const updateProductJsonFetch = async (productId, updatedData) => {
  try {
    const token = 'YOUR_AUTH_TOKEN';
    const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'PUT',
      credentials: 'include', // Important for sending cookies
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product (JSON)');
    }
    console.log('Product updated (JSON):', data);
    return data;
  } catch (error) {
    console.error('Error updating product (JSON):', error.message);
    throw error;
  }
};

// Usage example:
// const productIdToUpdate = '60d5ec49f8c7b00015f6e4a2';
// const updatedProductDataJson = { ... };
// updateProductJsonFetch(productIdToUpdate, updatedProductDataJson);
```

### 6. Delete a Product

- **URL:** `/api/products/:id`
- **Method:** `DELETE`
- **Access:** Private/Admin
- **Description:** Deletes a product by its ID.

**Path Parameters:**

| Field | Type   | Description   |
| :---- | :----- | :------------ |
| `id`  | String | ID of the product|

**Example with `axios`:**

```javascript
import axios from 'axios';

const deleteProduct = async (productId) => {
  try {
    const token = 'YOUR_AUTH_TOKEN';
    const config = {
      withCredentials: true, // Important for sending cookies
      headers: {},
    };
    const response = await axios.delete(`http://localhost:3000/api/products/${productId}`, config);
    console.log('Product deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error.response ? error.response.data : error.message);
    throw error;
  }
};

deleteProduct('60d5ec49f8c7b00015f6e4a3'); // Replace with actual product ID
```

**Example with `fetch`:**

```javascript
const deleteProductFetch = async (productId) => {
  try {
    const token = 'YOUR_AUTH_TOKEN';
    const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'DELETE',
      credentials: 'include', // Important for sending cookies
      headers: {
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete product');
    }
    console.log('Product deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting product:', error.message);
    throw error;
  }
};

deleteProductFetch('60d5ec49f8c7b00015f6e4a3');
```

### 7. Get Products on Offer

- **URL:** `/api/products/offers`
- **Method:** `GET`
- **Access:** Public
- **Description:** Retrieves products that have an active discount. Supports pagination.

**Query Parameters:**

| Field   | Type   | Default | Description             |
| :------ | :----- | :------ | :---------------------- |\
| `page`  | Number | 1       | Page number             |\
| `limit` | Number | 10      | Number of items per page|

**Example with `axios`:**

```javascript
import axios from 'axios';

const getOfferProducts = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/products/offers?page=${page}&limit=${limit}`);
    console.log('Offer products:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching offer products:', error.response ? error.response.data : error.message);
    throw error;
  }
};

getOfferProducts();
```

**Example with `fetch`:**

```javascript
const getOfferProductsFetch = async (page = 1, limit = 10) => {
  try {
    const response = await fetch(`http://localhost:3000/api/products/offers?page=${page}&limit=${limit}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch offer products');
    }
    console.log('Offer products:', data);
    return data;
  } catch (error) {
    console.error('Error fetching offer products:', error.message);
    throw error;
  }
};

getOfferProductsFetch();
```

---

## Category Endpoints

### 1. Create a New Category

- **URL:** `/api/categories`
- **Method:** `POST`
- **Access:** Private/Admin
- **Description:** Creates a new category.

**Request Body (application/json):**

| Field  | Type   | Required | Description       |
| :----- | :----- | :------- | :---------------- |
| `name` | String | Yes      | Name of the category|

**Example with `axios`:**

```javascript
import axios from 'axios';

const createCategory = async (categoryName) => {
  try {
    const token = 'YOUR_AUTH_TOKEN';
    const config = {
      withCredentials: true, // Important for sending cookies
      headers: {
        'Content-Type': 'application/json'
      },
    };
    const response = await axios.post('http://localhost:3000/api/categories', { name: categoryName }, config);
    console.log('Category created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error.response ? error.response.data : error.message);
    throw error;
  }
};

createCategory('Electronics');
```

**Example with `fetch`:**

```javascript
const createCategoryFetch = async (categoryName) => {
  try {
    const token = 'YOUR_AUTH_TOKEN';
    const response = await fetch('http://localhost:3000/api/categories', {
      method: 'POST',
      credentials: 'include', // Important for sending cookies
      headers: {
   
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: categoryName }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create category');
    }
    console.log('Category created:', data);
    return data;
  } catch (error) {
    console.error('Error creating category:', error.message);
    throw error;
  }
};

createCategoryFetch('Books');
```

### 2. Get All Categories

- **URL:** `/api/categories`
- **Method:** `GET`
- **Access:** Public
- **Description:** Retrieves all categories.

**Example with `axios`:**

```javascript
import axios from 'axios';

const getAllCategories = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/categories');
    console.log('All categories:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error.response ? error.response.data : error.message);
    throw error;
  }
};

getAllCategories();
```

**Example with `fetch`:**

```javascript
const getAllCategoriesFetch = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/categories');
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch categories');
    }
    console.log('All categories:', data);
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    throw error;
  }
};

getAllCategoriesFetch();
```

### 3. Get Category by ID

- **URL:** `/api/categories/:id`
- **Method:** `GET`
- **Access:** Public
- **Description:** Retrieves a single category by its ID.

**Path Parameters:**

| Field | Type   | Description     |
| :---- | :----- | :-------------- |
| `id`  | String | ID of the category|

**Example with `axios`:**

```javascript
import axios from 'axios';

const getCategoryById = async (categoryId) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/categories/${categoryId}`);
    console.log('Category by ID:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching category by ID:', error.response ? error.response.data : error.message);
    throw error;
  }
};

getCategoryById('60d5ec49f8c7b00015f6e4a4'); // Replace with actual category ID
```

**Example with `fetch`:**

```javascript
const getCategoryByIdFetch = async (categoryId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch category by ID');
    }
    console.log('Category by ID:', data);
    return data;
  } catch (error) {
    console.error('Error fetching category by ID:', error.message);
    throw error;
  }
};

getCategoryByIdFetch('60d5ec49f8c7b00015f6e4a4');
```

### 4. Update a Category

- **URL:** `/api/categories/:id`
- **Method:** `PUT`
- **Access:** Private/Admin
- **Description:** Updates an existing category.

**Path Parameters:**

| Field | Type   | Description     |
| :---- | :----- | :-------------- |\
| `id`  | String | ID of the category|

**Request Body (application/json):**

| Field  | Type   | Required | Description       |
| :----- | :----- | :------- | :---------------- |\
| `name` | String | Yes      | New name of the category|

**Example with `axios`:**

```javascript
import axios from 'axios';

const updateCategory = async (categoryId, newName) => {
  try {
    const token = 'YOUR_AUTH_TOKEN';
    const config = {
      withCredentials: true, // Important for sending cookies
      headers: {
        'Content-Type': 'application/json'
      },
    };
    const response = await axios.put(`http://localhost:3000/api/categories/${categoryId}`, { name: newName }, config);
    console.log('Category updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error.response ? error.response.data : error.message);
    throw error;
  }
};

updateCategory('60d5ec49f8c7b00015f6e4a4', 'Updated Electronics'); // Replace with actual category ID
```

**Example with `fetch`:**

```javascript
const updateCategoryFetch = async (categoryId, newName) => {
  try {
    const token = 'YOUR_AUTH_TOKEN';
    const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
      method: 'PUT',
      credentials: 'include', // Important for sending cookies
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update category');
    }
    console.log('Category updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating category:', error.message);
    throw error;
  }
};

updateCategoryFetch('60d5ec49f8c7b00015f6e4a4', 'Updated Books');
```

### 5. Delete a Category

- **URL:** `/api/categories/:id`
- **Method:** `DELETE`
- **Access:** Private/Admin
- **Description:** Deletes a category by its ID.

**Path Parameters:**

| Field | Type   | Description     |
| :---- | :----- | :-------------- |\
| `id`  | String | ID of the category|

**Example with `axios`:**

```javascript
import axios from 'axios';

const deleteCategory = async (categoryId) => {
  try {
    const token = 'YOUR_AUTH_TOKEN';
    const config = {
      withCredentials: true, // Important for sending cookies
      headers: {},
    };
    const response = await axios.delete(`http://localhost:3000/api/categories/${categoryId}`, config);
    console.log('Category deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error.response ? error.response.data : error.message);
    throw error;
  }
};

deleteCategory('60d5ec49f8c7b00015f6e4a5'); // Replace with actual category ID
```

**Example with `fetch`:**

```javascript
const deleteCategoryFetch = async (categoryId) => {
  try {
    const token = 'YOUR_AUTH_TOKEN';
    const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
      method: 'DELETE',
      credentials: 'include', // Important for sending cookies
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete category');
    }
    console.log('Category deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting category:', error.message);
    throw error;
  }
};

deleteCategoryFetch('60d5ec49f8c7b00015f6e4a5');
```






          
بالتأكيد! سأقدم لك شرحًا مفصلاً لكيفية تعامل الواجهة الأمامية (Frontend) مع وظائف البحث والبحث التلقائي (Autocomplete) التي قمنا بتنفيذها في الواجهة الخلفية (Backend)، مع أمثلة باستخدام `axios` و `fetch`.

--- 

## التعامل مع البحث والبحث التلقائي من الواجهة الأمامية

لقد قمنا بتجهيز مسارين (routes) في الواجهة الخلفية للبحث:

1.  **البحث العادي (Regular Search):**
    *   المسار: `/api/products/search`
    *   النوع: `GET`
    *   الاستخدام: `GET /api/products/search?keyword=your_keyword&page=1&limit=10`
    *   يستخدم للبحث عن المنتجات التي تحتوي أسماؤها على الكلمة المفتاحية.

2.  **البحث التلقائي (Autocomplete):**
    *   المسار: `/api/products/autocomplete`
    *   النوع: `GET`
    *   الاستخدام: `GET /api/products/autocomplete?keyword=your_keyword&limit=5`
    *   يستخدم لتقديم اقتراحات لأسماء المنتجات بناءً على الكلمة المفتاحية التي يبدأ بها المستخدم كتابتها.

الآن، دعنا نرى كيفية استهلاك هذه المسارات من الواجهة الأمامية باستخدام `axios` و `fetch`.

### 1. البحث العادي (Regular Search)

#### باستخدام `axios`

```javascript
// افترض أن لديك مثيل axios معد مسبقًا أو تستخدم axios مباشرة
import axios from 'axios';

const searchProducts = async (keyword, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`/api/products/search`, {
      params: {
        keyword: keyword,
        page: page,
        limit: limit,
      },
    });
    console.log('نتائج البحث:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ في البحث عن المنتجات:', error);
    throw error;
  }
};

// مثال على الاستخدام:
// searchProducts('laptop', 1, 10).then(data => {
//   // قم بتحديث واجهة المستخدم الخاصة بك بالبيانات
// });
```

#### باستخدام `fetch`

```javascript
const searchProducts = async (keyword, page = 1, limit = 10) => {
  try {
    const response = await fetch(
      `/api/products/search?keyword=${keyword}&page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('نتائج البحث:', data);
    return data;
  } catch (error) {
    console.error('خطأ في البحث عن المنتجات:', error);
    throw error;
  }
};

// مثال على الاستخدام:
// searchProducts('phone', 1, 5).then(data => {
//   // قم بتحديث واجهة المستخدم الخاصة بك بالبيانات
// });
```

### 2. البحث التلقائي (Autocomplete)

#### باستخدام `axios`

```javascript
import axios from 'axios';

const autocompleteProducts = async (keyword, limit = 5) => {
  try {
    const response = await axios.get(`/api/products/autocomplete`, {
      params: {
        keyword: keyword,
        limit: limit,
      },
    });
    console.log('اقتراحات البحث التلقائي:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ في الحصول على اقتراحات البحث التلقائي:', error);
    throw error;
  }
};

// مثال على الاستخدام (يمكن ربطها بحدث onChange في حقل الإدخال):
// autocompleteProducts('sam').then(suggestions => {
//   // عرض الاقتراحات في قائمة منسدلة أو ما شابه
// });
```

#### باستخدام `fetch`

```javascript
const autocompleteProducts = async (keyword, limit = 5) => {
  try {
    const response = await fetch(
      `/api/products/autocomplete?keyword=${keyword}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('اقتراحات البحث التلقائي:', data);
    return data;
  } catch (error) {
    console.error('خطأ في الحصول على اقتراحات البحث التلقائي:', error);
    throw error;
  }
};

// مثال على الاستخدام:
// autocompleteProducts('app').then(suggestions => {
//   // عرض الاقتراحات
// });
```

### ملاحظات هامة للواجهة الأمامية:

*   **معالجة الأخطاء:** تأكد دائمًا من معالجة الأخطاء بشكل صحيح في الواجهة الأمامية لعرض رسائل مناسبة للمستخدم أو اتخاذ إجراءات بديلة.
*   **التحقق من الإدخال:** قم بالتحقق من صحة إدخالات المستخدم قبل إرسالها إلى الواجهة الخلفية.
*   **التحكم في حالة التحميل:** أظهر مؤشرات تحميل للمستخدم أثناء انتظار استجابة الواجهة الخلفية.
*   **الحد من الطلبات (Debouncing):** بالنسبة للبحث التلقائي، يفضل استخدام تقنية `debouncing` لتقليل عدد الطلبات المرسلة إلى الخادم. هذا يعني أنك لن ترسل طلبًا إلا بعد توقف المستخدم عن الكتابة لفترة قصيرة (مثل 300-500 مللي ثانية).
*   **تخزين النتائج مؤقتًا (Caching):** إذا كانت نتائج البحث لا تتغير كثيرًا، يمكنك التفكير في تخزينها مؤقتًا في الواجهة الأمامية لتحسين الأداء.

آمل أن يكون هذا الشرح مفيدًا لك!
        