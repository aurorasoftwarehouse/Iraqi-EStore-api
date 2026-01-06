# واجهة برمجة تطبيقات التجارة الإلكترونية - دليل جلب الفئات

###  https://iraqi-e-store-api.vercel.app/

يشرح هذا الدليل كيفية جلب بيانات الفئات من واجهة برمجة تطبيقات التجارة الإلكترونية. نقطة نهاية API للفئات هي `/api/categories`.

## نقطة نهاية API

## قسم 2: تفاعل واجهة الأمامية مع نظام المصادقة

### 1. إنشاء حساب مستخدم (من خلال <mcfile name="authController.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\controllers\authController.js"></mcfile>)
مسار الخلفية: `POST /api/auth/register`

#### مثال واجهة الأمامية (axios)
```javascript
import axios from 'axios';

const registerUser = async (userData) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
      withCredentials: true // لدعم الكوكيز (من <mcfile name="server.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\server.js"></mcfile>)
    });
    console.log('تم إنشاء الحساب:', response.data);
  } catch (error) {
    console.error('خطأ إنشاء الحساب:', error.response.data);
  }
};

// استدعاء الدالة
registerUser({ username: 'مثال', email: 'مثال@بريد.com', password: '123456' });
```

### 2. تسجيل الدخول (وضع الويب والموبايل)
- وصف الخلفية: من خلال `loginUser` في <mcfile name="authController.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\controllers\authController.js"></mcfile>
- مسار الخلفية: `POST /api/auth/login`

#### مثال واجهة الأمامية (وضع الويب - كوكيز)
```javascript
// من خلال fetch
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'مثال@بريد.com', password: '123456', client: 'web' }),
  credentials: 'include' // لدعم الكوكيز (من <mcfolder name="middleware" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\middleware"></mcfolder>)
})
.then(response => response.json())
.then(data => console.log('تم تسجيل الدخول:', data))
.catch(error => console.error('خطأ تسجيل الدخول:', error));
```

#### مثال واجهة الأمامية (وضع الموبايل - رموز مميزة)
```javascript
import axios from 'axios';

const loginMobile = async (userData) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      ...userData,
      client: 'mobile'
    });
    // حفظ الرموز مميزة في تخزين الموبايل
    localStorage.setItem('accessToken', response.data.tokens.accessToken);
    localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
  } catch (error) {
    console.error('خطأ تسجيل الدخول:', error.response.data);
  }
};
```
### 3. التحقق من الرمز المميز (Verify Token)
- وصف الخلفية: من خلال `verifyAccessToken` في <mcfile name="authController.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\controllers\authController.js"></mcfile>
- مسار الخلفية: `POST /api/auth/verify`

#### مثال واجهة الأمامية
```javascript
const verifyToken = async () => {
  try {
    const response = await fetch('  URL_ADDRESS:5000/api/auth/verify', {
      method: 'POST',
      credentials: 'include' // لإرسال الكوكيز
    });
    const data = await response.json();
    console.log('التحقق من الرمز المميز:', data);
    return data.valid;      
  }
}   
```
          
مسار `/api/auth/me` يستخدم لجلب معلومات المستخدم الحالي بعد تسجيل الدخول. يتطلب هذا المسار مصادقة، مما يعني أنه يجب أن يكون المستخدم قد قام بتسجيل الدخول ولديه رمز وصول (access token) صالح.

في هذا المشروع، يتم حماية هذا المسار بواسطة `authMiddleware` (المشار إليه بـ `protect` في <mcfile name="authRoutes.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\routes\authRoutes.js"></mcfile>)، والذي يتحقق من صحة رمز الوصول الخاص بالمستخدم.

**مثال باستخدام Axios:**

لجلب معلومات المستخدم الحالي باستخدام `axios`، ستحتاج إلى التأكد من أن رمز الوصول الخاص بك يتم إرساله مع الطلب. إذا كنت تستخدم الكوكيز للمصادقة (كما هو الحال في إعدادات الويب لهذا المشروع)، فسيتم إرسالها تلقائيًا إذا قمت بتعيين `withCredentials: true`.

```javascript
import axios from 'axios';

const getMe = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/auth/me', {
      withCredentials: true // مهم لإرسال الكوكيز (رموز المصادقة)
    });
    console.log('معلومات المستخدم:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ أثناء جلب معلومات المستخدم:', error.response ? error.response.data : error.message);
    return null;
  }
};

// استدعاء الدالة لجلب معلومات المستخدم
getMe();
```

**شرح:**

1.  **`axios.get('http://localhost:5000/api/auth/me', ...)`**: هذا هو الطلب الذي يتم إرساله إلى نقطة النهاية `/api/auth/me`.
2.  **`withCredentials: true`**: هذا الخيار ضروري لـ `axios` لإرسال الكوكيز (التي تحتوي على رمز الوصول) مع الطلب. بدونها، لن يتمكن الخادم من التعرف على المستخدم، وسيعيد خطأ مصادقة.

عند نجاح الطلب، ستتلقى بيانات المستخدم في `response.data`.
        


### 4. تحديث الرمز المميز (refresh token)
- وصف الخلفية: من خلال `refreshAccessToken` في <mcfile name="authController.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\controllers\authController.js"></mcfile>
- مسار الخلفية: `POST /api/auth/refresh`

#### مثال واجهة الأمامية
```javascript
const refreshToken = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: 'web' }),
      credentials: 'include'
    });
    console.log('تم تحديث الرمز المميز:', response.data);
  } catch (error) {
    console.error('خطأ تحديث الرمز المميز:', error);
  }
};
```

### 5. تسجيل الدخول كمسؤول (admin)
- وصف الخلفية: من خلال `logiadmin` في <mcfile name="authController.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\controllers\authController.js"></mcfile> و <mcsymbol name="adminAuthMiddleware" filename="adminAuthMiddleware.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\middleware\adminAuthMiddleware.js" startline="1" type="function"></mcsymbol>
- مسار الخلفية: `POST /api/auth/loginadmin`
- الحقول المطلوبة: `email`, `password`, `client` (اختياري، الافتراضي `web`)

#### مثال واجهة الأمامية
```javascript
const loginAdmin = async (adminData) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/loginadmin', adminData, {
      withCredentials: true
    });
    console.log('تم تسجيل الدخول كمسؤول:', response.data);
  } catch (error) {
    console.error('خطأ تسجيل الدخول كمسؤول:', error.response.data);
  }
};
```

### 7. تحديث الرمز المميز للمسؤول (Admin Refresh Token)
- وصف الخلفية: من خلال `AdminRefreshAccessToken` في <mcfile name="authController.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\controllers\authController.js"></mcfile>
- مسار الخلفية: `POST /api/auth/adminrefresh`
- الحقول المطلوبة: `client` (اختياري، الافتراضي `web`)، `refreshToken` (مطلوب للموبايل فقط في الـ body أو الـ headers)

#### مثال واجهة الأمامية (Web - Cookies)
```javascript
const adminRefreshTokenWeb = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/adminrefresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: 'web' }),
      credentials: 'include'
    });
    console.log('تم تحديث الرمز المميز للمسؤول (ويب):', response.data);
  } catch (error) {
    console.error('خطأ تحديث الرمز المميز للمسؤول (ويب):', error);
  }
};
```

#### مثال واجهة الأمامية (Mobile - Tokens)
```javascript
const adminRefreshTokenMobile = async (refreshToken) => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/adminrefresh', {
      client: 'mobile',
      refreshToken: refreshToken // يجب إرسال الـ refreshToken هنا
    });
    console.log('تم تحديث الرمز المميز للمسؤول (موبايل):', response.data);
    return response.data.accessToken;
  } catch (error) {
    console.error('خطأ تحديث الرمز المميز للمسؤول (موبايل):', error.response.data);
  }
};
```

### 8. التحقق من الرمز المميز للمسؤول (Verify Admin Token)
- وصف الخلفية: من خلال `verifyadminAccessToken` في <mcfile name="authController.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\controllers\authController.js"></mcfile>
- مسار الخلفية: `POST /api/auth/verifyadmin`
- الحقول المطلوبة: لا توجد حقول في الـ body، يتم التحقق من الـ `accessToken` من الكوكيز.

#### مثال واجهة الأمامية
```javascript
const verifyAdminToken = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/verifyadmin', {
      method: 'POST',
      credentials: 'include' // لإرسال الكوكيز
    });
    const data = await response.json();
    console.log('التحقق من رمز المسؤول:', data);
    return data.valid;
  } catch (error) {
    console.error('خطأ التحقق من رمز المسؤول:', error);
    return false;
  }
};
```

### 9. تسجيل الخروج (Logout)
- وصف الخلفية: من خلال `logoutUser` في <mcfile name="authController.js" path="d:\new valume 1 D\my project\projects with dina abaza\e-comm\controllers\authController.js"></mcfile>
- مسار الخلفية: `POST /api/auth/logout`
- الحقول المطلوبة: `client` (اختياري، الافتراضي `web`)

#### مثال واجهة الأمامية (Web - Cookies)
```javascript
const logoutWeb = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: 'web' }),
      credentials: 'include' // لإرسال الكوكيز لمسحها
    });
    const data = await response.json();
    console.log('تسجيل الخروج (ويب):', data.message);
  } catch (error) {
    console.error('خطأ تسجيل الخروج (ويب):', error);
  }
};
```

#### مثال واجهة الأمامية (Mobile - Tokens)
```javascript
const logoutMobile = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/logout', {
      client: 'mobile'
    });
    // يجب على العميل مسح التوكنات محليًا هنا (مثلاً من localStorage)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('تسجيل الخروج (موبايل):', response.data.message);
  } catch (error) {
    console.error('خطأ تسجيل الخروج (موبايل):', error.response.data);
  }
};
```


## قس: إدارة إعدادات الموقع (Site Settings)

تتيح واجهة برمجة التطبيقات هذه للمسؤولين تعديل إعدادات الموقع العامة، بما في ذلك معلومات الاتصال وروابط وسائل التواصل الاجتماعي. يمكن للواجهة الأمامية استخدام هذه الإعدادات لعرضها في تذييل الموقع أو صفحات الاتصال.

### 1. جلب إعدادات الموقع (Get Site Settings)
-   **الوصف:** يجلب جميع إعدادات الموقع الحالية.
-   **مسار الخلفية:** `GET /api/settings`
-   **الوصول:** عام (Public)

#### مثال واجهة الأمامية (axios)
```javascript
import axios from 'axios';

const getSiteSettings = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/settings');
    console.log('إعدادات الموقع:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ في جلب إعدادات الموقع:', error.response ? error.response.data : error.message);
    return null;
  }
};

getSiteSettings();
```

### 2. تحديث إعدادات الموقع (Update Site Settings)
-   **الوصف:** يقوم بتحديث إعدادات الموقع. يتطلب مصادقة المسؤول.
-   **مسار الخلفية:** `PUT /api/settings`
-   **الوصول:** خاص/مسؤول (Private/Admin)

#### الحقول المطلوبة في جسم الطلب (Request Body Fields)

| الحقل            | النوع    | الوصف                                     | مثال                                     |
| :--------------- | :------ | :---------------------------------------- | :---------------------------------------- |
| `footerText`     | `String`  | نص التذييل الذي يظهر في أسفل الموقع.      | `جميع الحقوق محفوظة لمتجرنا © 2023`       |
| `contactEmail`   | `String`  | البريد الإلكتروني للتواصل.                | `info@example.com`                        |
| `phone`          | `String`  | رقم الهاتف للتواصل.                       | `+9647701234567`                          |
| `facebookLink`   | `String`  | رابط صفحة الفيسبوك.                       | `https://www.facebook.com/yourpage`       |
| `instagramLink`  | `String`  | رابط صفحة الإنستغرام.                     | `https://www.instagram.com/yourpage`      |
| `whatsappLink`   | `String`  | رابط الواتساب (يمكن أن يكون رابط مباشر).  | `https://wa.me/9647701234567`             |
| `tiktokLink`     | `String`  | رابط صفحة التيك توك.                      | `https://www.tiktok.com/@yourpage`        |
| `telegramChatId` | `String`  | معرف الدردشة الخاص ببوت التليجرام (للتنبيهات). | `123456789`                               |

#### مثال واجهة الأمامية (axios)
```javascript
import axios from 'axios';

const updateSiteSettings = async (settingsData) => {
  try {
    const response = await axios.put('http://localhost:5000/api/settings', settingsData, {
      withCredentials: true // لإرسال كوكيز المصادقة للمسؤول
    });
    console.log('تم تحديث إعدادات الموقع:', response.data);
    return response.data;
  } catch (error) {
    console.error('خطأ في تحديث إعدادات الموقع:', error.response ? error.response.data : error.message);
    return null;
  }
};

// مثال على البيانات التي يمكن إرسالها
const newSettings = {
  footerText: 'حقوق النشر © 2024 متجرنا. جميع الحقوق محفوظة.',
  contactEmail: 'support@newexample.com',
  phone: '+9647809876543',
  facebookLink: 'https://www.facebook.com/newpage',
  instagramLink: 'https://www.instagram.com/newpage',
  whatsappLink: 'https://wa.me/9647809876543',
  tiktokLink: 'https://www.tiktok.com/@newpage',
  telegramChatId: '987654321'
};

updateSiteSettings(newSettings);
```


