# دليل استخدام واجهات مراجعات المنتجات (Next.js)

هذا الملف يشرح كيفية التعامل مع واجهات الـ API الخاصة بنظام المراجعات والتقييمات في مشروع التجارة الإلكترونية، مع أمثلة عملية لاستخدام axios وFetch، ومتطلبات المصادقة، ونماذج طلب/استجابة، وأفضل الممارسات، واعتبارات خاصة بـ Next.js (SSR/SSG/Client).

## الأساسيات
- عنوان الأساس للـ API: يفضّل تعريفه في متغير بيئي:
  - في Next.js: أنشئ `.env.local` وضع:  
    `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api`
- المصادقة: الـ API يعتمد JWT:
  - للويب: التوكن يُحفظ في كوكيز باسم `accessToken` ويقرأ تلقائياً في الخادم [authMiddleware.js](file:///d:/new%20valume%201%20D/my%20project/projects%20with%20dina%20abaza/e-comm/middleware/authMiddleware.js).
  - للموبايل/العميل: أرسل التوكن في رأس `Authorization: Bearer <token>`.
- نقاط النهاية للمراجعات مسجّلة تحت `/api/reviews` [server.js](file:///d:/new%20valume%201%20D/my%20project/projects%20with%20dina%20abaza/e-comm/server.js#L52-L56) عبر [reviewRoutes.js](file:///d:/new%20valume%201%20D/my%20project/projects%20with%20dina%20abaza/e-comm/routes/reviewRoutes.js).

## نقاط النهاية (Endpoints)
1) إضافة مراجعة
- POST `/api/reviews` (مصادقة مطلوبة)
- Body:
  ```json
  { "productId": "PRODUCT_ID", "rating": 4.5, "comment": "نص حتى 500 حرف" }
  ```
- قيود:
  - rating بين 1 و5 بدقة 0.5
  - comment ≤ 500 حرف
  - شرط الشراء إن كان مفعّل في إعدادات الموقع [SiteSettings.js](file:///d:/new%20valume%201%20D/my%20project/projects%20with%20dina%20abaza/e-comm/models/SiteSettings.js)

2) عرض المراجعات مع الترتيب والتقسيم الصفحي
- GET `/api/reviews`
- Query:
  - `productId` اختياري
  - `rating` اختياري (1..5)
  - `page` رقم الصفحة (افتراضي 1)
  - `limit` حجم الصفحة (افتراضي 10)
  - `sort` أحد القيم: `date` (الأحدث أولاً)، `rating` (الأعلى أولاً)، `helpful` (الأكثر فائدة)
- Response مثال:
  ```json
  {
    "reviews": [{ "_id":"r1","rating":4.5,"comment":"...","helpfulCount":0 }],
    "totalPages": 3,
    "currentPage": 1
  }
  ```

3) التصويت على فائدة المراجعة
- POST `/api/reviews/:id/vote` (مصادقة)
- Body:
  ```json
  { "value": "helpful" } // أو "not_helpful"
  ```
- يعيد كائن المراجعة بعد تحديث العدادات.

4) الإبلاغ عن مراجعة غير لائقة
- POST `/api/reviews/:id/report` (مصادقة)
- Body:
  ```json
  { "reason": "spam", "details": "اختياري حتى 500" }
  ```
- الأسباب المسموح بها تُعرّف في إعدادات الموقع: `reviewReportReasons`.

5) واجهات إدارة المسؤول
- DELETE `/api/reviews/:id` (مصادقة مسؤول) Body: `{ "reason": "سبب اختياري" }`
- PUT `/api/reviews/:id` (مصادقة مسؤول) Body: `{ "comment": "≤500" }`
- PUT `/api/reviews/:id/toggle` (مصادقة مسؤول) Body: `{ "enable": true|false }`
- POST `/api/reviews/:id/reply` (مصادقة مسؤول) Body: `{ "content": "≤500" }`
- GET `/api/reviews/admin?status=enabled&minRating=3&maxRating=5&product=بحث&page=1&limit=10`

6) الإحصاءات
- متوسط التقييم: GET `/api/reviews/stats/average?productId=...`
  - يعيد مصفوفة من كائنات `{ _id: "productId", average: Number, count: Number }`
- توزيع التقييمات: GET `/api/reviews/stats/distribution?productId=...`
  - يعيد `{ _id: rating, count }` مرتبة تصاعديًا
- أكثر المنتجات مراجعة: GET `/api/reviews/stats/top-products?limit=10`
  - يعيد `{ productId, name, count }`
- نشاط المراجعات: GET `/api/reviews/stats/activity?startDate=...&endDate=...&granularity=day|month`
  - يعيد تجميعًا حسب اليوم/الشهر مع `count`

## المصادقة (Authentication)
- الويب (كوكيز): إن كان `accessToken` محفوظًا كوكيز، يكفي إرسال الطلب مع `credentials: 'include'` في fetch أو `withCredentials: true` في axios.
- العميل/الموبايل: أرسل التوكن ضمن رأس `Authorization: Bearer <token>`.
- المسؤول: نفس الآلية، لكن يجب أن يكون دور المستخدم `admin`؛ التحقق يتم عبر [adminAuthMiddleware.js](file:///d:/new%20valume%201%20D/my%20project/projects%20with%20dina%20abaza/e-comm/middleware/adminAuthMiddleware.js).

## أمثلة باستخدام axios
إعداد قاعدة URL:
```javascript
import axios from 'axios';
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true // لإرسال الكوكيز تلقائياً عند الحاجة
});
```

إضافة مراجعة:
```javascript
// يمرر الكوكيز تلقائياً إن كانت موجودة (وضع الويب)
const addReview = async (productId, rating, comment) => {
  const res = await api.post('/reviews', { productId, rating, comment });
  return res.data;
};
```

عرض المراجعات:
```javascript
const listReviews = async ({ productId, page = 1, limit = 10, sort = 'date' }) => {
  const params = { productId, page, limit, sort };
  const res = await api.get('/reviews', { params });
  return res.data; // { reviews, totalPages, currentPage }
};
```

تصويت فائدة:
```javascript
const voteHelpful = async (reviewId, value = 'helpful', token) => {
  const res = await api.post(`/reviews/${reviewId}/vote`, { value }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
};
```

بلاغ:
```javascript
const reportReview = async (reviewId, reason, details, token) => {
  const res = await api.post(`/reviews/${reviewId}/report`, { reason, details }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return res.data;
};
```

إدارة مسؤول:
```javascript
const adminToggleReview = async (reviewId, enable, token) => {
  const res = await api.put(`/reviews/${reviewId}/toggle`, { enable }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data; // الحالة الجديدة
};
```

## أمثلة باستخدام Fetch API
إضافة مراجعة (كوكيز/ويب):
```javascript
const addReviewFetch = async (productId, rating, comment) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${base}/reviews`, {
    method: 'POST',
    credentials: 'include', // لإرسال الكوكيز
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, rating, comment })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'فشل إضافة المراجعة');
  return data;
};
```

تصويت فائدة (Bearer):
```javascript
const voteFetch = async (reviewId, value, token) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${base}/reviews/${reviewId}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ value })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'فشل التصويت');
  return data;
};
```

عرض المراجعات:
```javascript
const listFetch = async ({ productId, page = 1, limit = 10, sort = 'date' }) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const params = new URLSearchParams({ productId, page, limit, sort });
  const res = await fetch(`${base}/reviews?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'فشل الجلب');
  return data;
};
```

## إدارة الحالة ومعالجة الأخطاء (Client-side)
```javascript
import { useEffect, useState } from 'react';

export function ReviewsList({ productId }) {
  const [state, setState] = useState({ reviews: [], page: 1, totalPages: 1, loading: false, error: null });

  const fetchPage = async (page = 1) => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await listFetch({ productId, page, limit: 10, sort: 'helpful' });
      setState(s => ({ ...s, reviews: data.reviews, page: data.currentPage, totalPages: data.totalPages, loading: false }));
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: err.message }));
    }
  };

  useEffect(() => { fetchPage(1); }, [productId]);

  if (state.loading) return <p>تحميل...</p>;
  if (state.error) return <p>خطأ: {state.error}</p>;

  return (
    <div>
      <ul>
        {state.reviews.map(r => (
          <li key={r._id}>
            {r.rating} نجوم - {r.comment}
            {/* مثال تصويت */}
            <button onClick={() => voteFetch(r._id, 'helpful')}>مفيد</button>
          </li>
        ))}
      </ul>
      <button disabled={state.page <= 1} onClick={() => fetchPage(state.page - 1)}>السابق</button>
      <button disabled={state.page >= state.totalPages} onClick={() => fetchPage(state.page + 1)}>التالي</button>
    </div>
  );
}
```

## اعتبارات خاصة بـ Next.js
- getServerSideProps (Pages Router):
  ```javascript
  export async function getServerSideProps(ctx) {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const productId = ctx.params.id;
    // تمرير الكوكيز من الطلب إلى الـ API عند الحاجة
    const res = await fetch(`${base}/reviews?productId=${productId}`, {
      headers: { cookie: ctx.req.headers.cookie || '' }
    });
    const data = await res.json();
    return { props: { initialReviews: data.reviews } };
  }
  ```
- App Router (Next 13+):
  - في SSR استخدم `cookies()` لقراءة الكوكيز وتمريرها للـ API بالرأس `cookie`.
- getStaticProps:
  - يفضّل استخدام ISR لإعادة توليد الصفحات دورياً لأن بيانات المراجعات ديناميكية.
  ```javascript
  export async function getStaticProps() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${base}/reviews?productId=...`);
    const data = await res.json();
    return { props: { initialReviews: data.reviews }, revalidate: 60 };
  }
  ```
- Client-side:
  - استخدم `useEffect`، وتأكد من أن الوصول لـ `localStorage` يتم في المتصفح فقط.

## أفضل الممارسات والأمان
- لا تخزّن الأسرار في الواجهة الأمامية. استخدم متغيرات بيئية آمنة ومسارات API الوسيطة عند الحاجة.
- التحقق من المدخلات:
  - احترم القيود: rating بنصف نجمة، تعليق ≤ 500.
  - اعرض رسائل أخطاء واضحة للمستخدم.
- التعامل مع المصادقة:
  - في المتصفح استخدم الكوكيز (`withCredentials`/`credentials: 'include'`).
  - في الطلبات المبرمجة (Server-side) مرّر الكوكيز يدويًا أو أرسل Bearer Token.
- الشبكات والأداء:
  - استخدم ترقيم الصفحات والفرز لتقليل البيانات المنقولة.
  - نفّذ إعادة محاولة محدودة وفواصل (debounce) في البحث والفرز إن لزم.
- الخصوصية والبلاغات:
  - اعرض واجهة للإبلاغ بسبب محدّد؛ لا تسرب معلومات المستخدمين.

## مرجع الملفات
- المسارات: [reviewRoutes.js](file:///d:/new%20valume%201%20D/my%20project/projects%20with%20dina%20abaza/e-comm/routes/reviewRoutes.js)
- وحدة التحكم: [reviewController.js](file:///d:/new%20valume%201%20D/my%20project/projects%20with%20dina%20abaza/e-comm/controllers/reviewController.js)
- الخدمات: [reviewService.js](file:///d:/new%20valume%201%20D/my%20project/projects%20with%20dina%20abaza/e-comm/services/reviewService.js)
