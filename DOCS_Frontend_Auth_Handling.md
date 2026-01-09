# توثيق معالجة المصادقة في الواجهة الأمامية (Frontend Authentication Handling)

يحدد هذا المستند النهج الموصى به للواجهة الأمامية للتعامل مع المصادقة، مما يضمن المرونة سواء كانت ملفات تعريف الارتباط (cookies) للمتصفح ممكّنة أو معطلة. تم تصميم `authMiddleware` في الواجهة الخلفية لدعم كلا السيناريوهين بسلاسة.

## 1. التحقق من دعم ملفات تعريف الارتباط (Cookie Support)

قبل بدء أي طلبات مصادقة، يجب على الواجهة الأمامية أولاً تحديد ما إذا كان متصفح المستخدم يدعم ويسمح بملفات تعريف الارتباط. يمكن القيام بذلك عن طريق محاولة تعيين واسترداد ملف تعريف ارتباط اختباري.

**مثال (JavaScript):**

```javascript
function areCookiesEnabled() {
  try {
    document.cookie = 'testcookie=true; SameSite=Lax';
    const cookieEnabled = document.cookie.indexOf('testcookie') !== -1;
    document.cookie = 'testcookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax'; // Clear the test cookie
    return cookieEnabled;
  } catch (e) {
    return false;
  }
}

const cookiesEnabled = areCookiesEnabled();
console.log('Cookies enabled:', cookiesEnabled);
```

## 2. منطق طلب المصادقة (Authentication Request Logic)

بناءً على حالة `cookiesEnabled`، يجب على الواجهة الأمامية تعديل حمولة طلب المصادقة الخاص بها:

### السيناريو أ: ملفات تعريف الارتباط ممكّنة

إذا كانت `areCookiesEnabled()` تُرجع `true`، فيجب على الواجهة الأمامية إرسال `client: "web"` في نص الطلب للمصادقة (مثل تسجيل الدخول، التسجيل). يشير هذا إلى الواجهة الخلفية أنه يجب عليها تخزين `accessToken` و `refreshToken` في ملفات تعريف الارتباط `httpOnly`.

**مثال (طلب تسجيل الدخول مع تمكين ملفات تعريف الارتباط):**

```javascript
async function loginWithCookies(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      client: 'web' // Indicate to backend to use httpOnly cookies
    }),
  });

  if (!response.ok) {
    // Handle error
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  // No tokens will be in the response body; they are set as httpOnly cookies.
  console.log('Login successful. Tokens stored in httpOnly cookies.');
  return response.json(); // Or handle success based on backend response
}
```

### السيناريو ب: ملفات تعريف الارتباط معطلة

إذا كانت `areCookiesEnabled()` تُرجع `false`، فيجب على الواجهة الأمامية **عدم** إرسال `client: "web"` (أو إرسال أي قيمة أخرى مثل `client: "mobile"` إذا كان ذلك مناسبًا) في نص طلب المصادقة. في هذه الحالة، ستقوم الواجهة الخلفية بإرجاع `accessToken` و `refreshToken` مباشرة في نص الاستجابة، والتي يجب على الواجهة الأمامية تخزينها في `localStorage`.

**مثال (طلب تسجيل الدخول مع تعطيل ملفات تعريف الارتباط):**

```javascript
async function loginWithoutCookies(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      // Do NOT send client: 'web'. Backend will return tokens in body.
    }),
  });

  if (!response.ok) {
    // Handle error
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  const { accessToken, refreshToken } = data;

  if (accessToken && refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    console.log('Login successful. Tokens stored in localStorage.');
  } else {
    throw new Error('Tokens not received in response.');
  }

  return data;
}
```

## 3. إرسال الرموز المميزة مع الطلبات المصادق عليها

بغض النظر عما إذا كانت الرموز المميزة مخزنة في ملفات تعريف الارتباط `httpOnly` أو `localStorage`، تم تصميم `authMiddleware` في الواجهة الخلفية لاستخراج `accessToken` من أي مصدر. لذلك، يظل نهج الواجهة الأمامية لإرسال الطلبات المصادق عليها متسقًا:

- إذا كانت الرموز المميزة موجودة في `localStorage`، فاسترد `accessToken` وقم بتضمينه في رأس `Authorization` كرمز `Bearer`.
- إذا كانت الرموز المميزة موجودة في ملفات تعريف الارتباط `httpOnly`، فسيقوم المتصفح بإرسالها تلقائيًا مع الطلب.

**مثال (طلب مصادق عليه):**

```javascript
async function makeAuthenticatedRequest(url, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  // If cookies are disabled, retrieve token from localStorage
  if (!cookiesEnabled) {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  const options = {
    method,
    headers,
    // credentials: 'include' is important for sending httpOnly cookies
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (response.status === 401) {
    // Token expired or invalid, attempt to refresh
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request
      return makeAuthenticatedRequest(url, method, body);
    } else {
      // Refresh failed, redirect to login
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Request failed');
  }

  return response.json();
}
```

## 4. آلية تحديث الرمز المميز (Token Refresh Mechanism)

عندما تنتهي صلاحية `accessToken` (يشار إلى ذلك باستجابة 401 غير مصرح به من الواجهة الخلفية)، يجب على الواجهة الأمامية محاولة تحديثه باستخدام `refreshToken`.

- إذا كان `refreshToken` موجودًا في ملفات تعريف الارتباط `httpOnly`، فسيقوم المتصفح بإرساله تلقائيًا.
- إذا كان `refreshToken` موجودًا في `localStorage`، فاسترده وأرسله في نص الطلب أو الرأس إلى نقطة نهاية التحديث.

**مثال (تحديث الرمز المميز):**

```javascript
async function refreshAccessToken() {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    let body = {};

    if (!cookiesEnabled) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('No refresh token found in localStorage.');
        return false;
      }
      body = { refreshToken };
    }

    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to refresh token.');
      // Clear tokens and redirect to login if refresh fails
      logout();
      return false;
    }

    if (!cookiesEnabled) {
      const data = await response.json();
      const { accessToken, refreshToken: newRefreshToken } = data;
      if (accessToken && newRefreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        console.log('Tokens refreshed and updated in localStorage.');
        return true;
      }
    } else {
      // Tokens are updated in httpOnly cookies by the backend
      console.log('Tokens refreshed via httpOnly cookies.');
      return true;
    }
  } catch (error) {
    console.error('Error during token refresh:', error);
    logout();
    return false;
  }
}
```

## 5. تسجيل الخروج (Logout)

عند تسجيل الخروج، يجب على الواجهة الأمامية مسح أي رموز مميزة مخزنة.

- إذا كانت الرموز المميزة موجودة في ملفات تعريف الارتباط `httpOnly`، فستتولى نقطة نهاية تسجيل الخروج في الواجهة الخلفية مسحها.
- إذا كانت الرموز المميزة موجودة في `localStorage`، فامسحها يدويًا.

**مثال (تسجيل الخروج):**

```javascript
async function logout() {
  try {
    // Call backend logout endpoint to clear httpOnly cookies if applicable
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

    // Clear tokens from localStorage if used
    if (!cookiesEnabled) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.log('Tokens cleared from localStorage.');
    }

    console.log('Logged out successfully.');
    window.location.href = '/login'; // Redirect to login page
  } catch (error) {
    console.error('Error during logout:', error);
  }
}
```

## 6. اعتبارات الأمان (Security Considerations)

-   **ملفات تعريف الارتباط `httpOnly`:** عندما تكون ملفات تعريف الارتباط ممكّنة، فإن ملفات تعريف الارتباط `httpOnly` هي الطريقة المفضلة لتخزين الرموز المميزة نظرًا لأمانها المحسّن ضد هجمات البرمجة النصية عبر المواقع (XSS). لا يمكن لـ JavaScript الوصول إلى ملفات تعريف الارتباط `httpOnly`، مما يجعل من الصعب على المهاجمين سرقة الرموز المميزة حتى لو كانت هناك ثغرات أمنية في XSS.
-   **`localStorage`:** على الرغم من أنها مريحة، فإن تخزين الرموز المميزة في `localStorage` يجعلها عرضة لهجمات XSS. إذا تمكن المهاجم من حقن JavaScript ضار في الواجهة الأمامية الخاصة بك، فيمكنه بسهولة الوصول إلى الرموز المميزة وسرقتها من `localStorage`. قم بتطبيق سياسات أمان المحتوى (CSPs) القوية وتطهير جميع مدخلات المستخدم للتخفيف من مخاطر XSS عند استخدام `localStorage`.