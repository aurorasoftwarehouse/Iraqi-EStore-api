# دليل واجهة برمجة التطبيقات للواجهة الأمامية (Frontend API Guide)

هذا الدليل يقدم شرحًا موجزًا لكيفية تفاعل الواجهة الأمامية مع واجهات برمجة التطبيقات  الخاصة بالمستخدم وعربة التسوق (Cart) في هذا المشروع، مع أمثلة باستخدام `axios` و `fetch`.


### 1 جلب بيانات المستخدم الحالي (Get Current User Data - getMe)

**المسار:** `GET /api/auth/me`
**المتطلبات:** يجب أن يكون المستخدم مصادقًا (authenticated) ويحمل `accessToken` صالحًا في الكوكيز (لـ `web`) أو في رأس `Authorization` (لـ `mobile`).

**مثال باستخدام Axios:**
```javascript
import axios from 'axios';

const getMe = async () => {
  try {
    const response = await axios.get('/api/auth/me', {
      withCredentials: true // مهم لإرسال الكوكيز مع الطلب
      // For mobile, you might need to set Authorization header:
      // headers: { Authorization: `Bearer YOUR_ACCESS_TOKEN` }
    });
    console.log('بيانات المستخدم:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب بيانات المستخدم:', error.response ? error.response.data : error.message);
    throw error;
  }
};
```

**مثال باستخدام Fetch:**
```javascript
const getMe = async (accessToken = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: headers,
      credentials: 'include' // مهم لإرسال الكوكيز مع الطلب
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'فشل جلب بيانات المستخدم');
    }
    console.log('بيانات المستخدم:', data);
    return data;
  } catch (error) {
    console.error('خطأ في جلب بيانات المستخدم:', error.message);
    throw error;
  }
};
```



## 2. عمليات عربة التسوق (Cart Operations)

**ملاحظة:** جميع مسارات عربة التسوق تتطلب مصادقة المستخدم.

### 2.1 جلب عربة التسوق للمستخدم (Get User Cart)

**المسار:** `GET /api/cart/:userId`

**مثال باستخدام Axios:**
```javascript
import axios from 'axios';

const getUserCart = async (userId) => {
  try {
    const response = await axios.get(`/api/cart/${userId}`, {
      withCredentials: true
    });
    console.log('عربة التسوق:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب عربة التسوق:', error.response ? error.response.data : error.message);
    throw error;
  }
};
```

**مثال باستخدام Fetch:**
```javascript
const getUserCart = async (userId, accessToken = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`/api/cart/${userId}`, {
      method: 'GET',
      headers: headers,
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'فشل جلب عربة التسوق');
    }
    console.log('عربة التسوق:', data);
    return data;
  } catch (error) {
    console.error('خطأ في جلب عربة التسوق:', error.message);
    throw error;
  }
};
```

### 2.2 إضافة منتج إلى عربة التسوق (Add Item to Cart)

**المسار:** `POST /api/cart`
**الجسم (Body):**
```json
{
  "userId": "معرف المستخدم",
  "productId": "معرف المنتج",
  "qty": 1
}
```

**مثال باستخدام Axios:**
```javascript
import axios from 'axios';

const addItemToCart = async (userId, productId, qty) => {
  try {
    const response = await axios.post('/api/cart', {
      userId,
      productId,
      qty
    }, {
      withCredentials: true
    });
    console.log('تم إضافة المنتج إلى العربة:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ في إضافة المنتج إلى العربة:', error.response ? error.response.data : error.message);
    throw error;
  }
};
```

**مثال باستخدام Fetch:**
```javascript
const addItemToCart = async (userId, productId, qty, accessToken = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        userId,
        productId,
        qty
      }),
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'فشل إضافة المنتج إلى العربة');
    }
    console.log('تم إضافة المنتج إلى العربة:', data);
    return data;
  } catch (error) {
    console.error('خطأ في إضافة المنتج إلى العربة:', error.message);
    throw error;
  }
};
```

### 2.3 تحديث كمية منتج في عربة التسوق (Update Cart Item Quantity)

**المسار:** `PUT /api/cart/item`
**الجسم (Body):**
```json
{
  "userId": "معرف المستخدم",
  "productId": "معرف المنتج",
  "qty": 2 // الكمية الجديدة
}
```

**مثال باستخدام Axios:**
```javascript
import axios from 'axios';

const updateCartItem = async (userId, productId, qty) => {
  try {
    const response = await axios.put('/api/cart/item', {
      userId,
      productId,
      qty
    }, {
      withCredentials: true
    });
    console.log('تم تحديث كمية المنتج في العربة:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث كمية المنتج:', error.response ? error.response.data : error.message);
    throw error;
  }
};
```

**مثال باستخدام Fetch:**
```javascript
const updateCartItem = async (userId, productId, qty, accessToken = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch('/api/cart/item', {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        userId,
        productId,
        qty
      }),
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'فشل تحديث كمية المنتج');
    }
    console.log('تم تحديث كمية المنتج في العربة:', data);
    return data;
  } catch (error) {
    console.error('خطأ في تحديث كمية المنتج:', error.message);
    throw error;
  }
};
```

### 2.4 إزالة منتج من عربة التسوق (Remove Item From Cart)

**المسار:** `DELETE /api/cart/item`
**الجسم (Body):**
```json
{
  "userId": "معرف المستخدم",
  "productId": "معرف المنتج"
}
```

**مثال باستخدام Axios:**
```javascript
import axios from 'axios';

const removeItemFromCart = async (userId, productId) => {
  try {
    const response = await axios.delete('/api/cart/item', {
      data: { userId, productId }, // لطلبات DELETE مع body
      withCredentials: true
    });
    console.log('تم إزالة المنتج من العربة:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ في إزالة المنتج من العربة:', error.response ? error.response.data : error.message);
    throw error;
  }
};
```

**مثال باستخدام Fetch:**
```javascript
const removeItemFromCart = async (userId, productId, accessToken = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch('/api/cart/item', {
      method: 'DELETE',
      headers: headers,
      body: JSON.stringify({
        userId,
        productId
      }),
      credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'فشل إزالة المنتج من العربة');
    }
    console.log('تم إزالة المنتج من العربة:', data);
    return data;
  } catch (error) {
    console.error('خطأ في إزالة المنتج من العربة:', error.message);
    throw error;
  }
};
```

## ملاحظات هامة للواجهة الأمامية:

*   **معالجة الأخطاء:** تأكد دائمًا من معالجة الأخطاء بشكل صحيح (مثل `try-catch` بلوك) وعرض رسائل خطأ مناسبة للمستخدم.
*   **التوكنات (Tokens):**
    *   لطلبات الويب (`client: "web"`)، يتم التعامل مع `accessToken` و `refreshToken` عبر `HTTP-only cookies`. يجب على الواجهة الأمامية التأكد من إرسال الكوكيز مع الطلبات (عادةً عن طريق `withCredentials: true` في `axios` أو `credentials: 'include'` في `fetch`).
    *   لطلبات الموبايل (`client: "mobile"`)، يتم إرجاع التوكنات في جسم الاستجابة. يجب على الواجهة الأمامية تخزينها بشكل آمن (مثل `localStorage` أو `AsyncStorage`) وإرسال `accessToken` في رأس `Authorization` كـ `Bearer Token` مع كل طلب محمي.
*   **`userId`:** في العديد من طلبات عربة التسوق، يتم تمرير `userId`. يمكنك الحصول على `userId` من بيانات المستخدم بعد تسجيل الدخول أو من استدعاء `getMe`.
*   **`productId`:** تأكد من أن `productId` الذي ترسله هو المعرف الصحيح للمنتج (عادةً ما يكون `_id` الخاص به من قاعدة البيانات).