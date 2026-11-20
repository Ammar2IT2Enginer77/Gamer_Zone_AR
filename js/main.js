/* ==========================================================================
   GAMER ZONE — Main Application Script
   واجهة عربية (RTL) مع إبقاء أسماء المنتجات والعلامات التجارية بالإنجليزية
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Configuration & Constants
   -------------------------------------------------------------------------- */
// سعر الصرف القابل للتعديل (1 دولار = 520 ريال يمني).
// عدّل هذا المتغير فقط لتحديث جميع الأسعار بالريال اليمني في الموقع.
const GZ_RATE = 520;

const FALLBACK_IMAGE_URL = 'https://placehold.co/700x500/171724/00b8ff?text=GAMER+ZONE';
const STORAGE_KEY_CART = 'gz_cart';
const STORAGE_KEY_CUSTOM_PRODUCTS = 'gz_custom_products';
const STORAGE_KEY_ORDERS = 'gz_orders';
const STORAGE_KEY_LAST_ORDER = 'gz_last_order';
const SESSION_KEY_ADMIN = 'gz_admin';

/* --------------------------------------------------------------------------
   2. Currency & Product Data Helpers
   -------------------------------------------------------------------------- */

/**
 * تنسيق السعر بالدولار الأمريكي وما يعادله بالريال اليمني.
 */
function formatPrice(usdAmount) {
  const numericPrice = Number(usdAmount);
  const formattedUsd = numericPrice.toFixed(2);
  const convertedYer = Math.round(numericPrice * GZ_RATE);
  const formattedYer = convertedYer.toLocaleString('en-US');

  return `$${formattedUsd} <small>${formattedYer} ريال يمني</small>`;
}

/**
 * قراءة المنتجات المخصصة المحفوظة من لوحة الإدارة في localStorage.
 */
function getCustomProducts() {
  const rawData = localStorage.getItem(STORAGE_KEY_CUSTOM_PRODUCTS) || '[]';
  const customProducts = JSON.parse(rawData);

  return customProducts;
}

/**
 * إرجاع جميع منتجات المتجر (الأساسية مدمجة مع تعديلات أو إضافات الإدارة).
 */
function getAllProducts() {
  const builtInProducts = window.GZ_PRODUCTS || [];
  const customProducts = getCustomProducts();
  const mergedProducts = [];
  const handledIds = new Set();

  // تضمين المنتجات الأساسية مع استبدال أي منتج تم تعديله من لوحة الإدارة
  for (let i = 0; i < builtInProducts.length; i++) {
    const builtInItem = builtInProducts[i];
    const editedVersion = customProducts.find(function (customItem) {
      return customItem.id === builtInItem.id;
    });

    if (editedVersion) {
      mergedProducts.push(editedVersion);
    } else {
      mergedProducts.push(builtInItem);
    }

    handledIds.add(builtInItem.id);
  }

  // إضافة المنتجات الجديدة التي أنشأها المدير
  for (let i = 0; i < customProducts.length; i++) {
    const customItem = customProducts[i];

    if (!handledIds.has(customItem.id)) {
      mergedProducts.push(customItem);
    }
  }

  return mergedProducts;
}

/**
 * البحث عن منتج واحد باستخدام المعرّف الخاص به.
 */
function findProductById(productId) {
  const allProducts = getAllProducts();
  const foundProduct = allProducts.find(function (product) {
    return product.id === productId;
  });

  return foundProduct;
}

/* --------------------------------------------------------------------------
   3. Shopping Cart Storage & Actions
   -------------------------------------------------------------------------- */

/**
 * قراءة عناصر سلة التسوق من localStorage.
 */
function readCart() {
  const rawCart = localStorage.getItem(STORAGE_KEY_CART) || '[]';
  const cartItems = JSON.parse(rawCart);

  return cartItems;
}

/**
 * حفظ سلة التسوق في localStorage وتحديث عداد السلة في الهيدر.
 */
function saveCart(cartItems) {
  const serializedCart = JSON.stringify(cartItems);
  localStorage.setItem(STORAGE_KEY_CART, serializedCart);
  updateCartCount();
}

/**
 * تحديث رقم عدد المنتجات الظاهر بجانب أيقونة السلة.
 */
function updateCartCount() {
  const countElements = document.querySelectorAll('.cart-count');
  const cartItems = readCart();
  let totalQuantity = 0;

  for (let i = 0; i < cartItems.length; i++) {
    totalQuantity = totalQuantity + cartItems[i].qty;
  }

  countElements.forEach(function (element) {
    element.textContent = totalQuantity;
  });
}

/**
 * إضافة منتج إلى السلة أو زيادة كميته إذا كان موجودًا مسبقًا.
 */
function addToCart(productId) {
  const product = findProductById(productId);

  if (!product) {
    return;
  }

  const cartItems = readCart();
  const existingItem = cartItems.find(function (item) {
    return item.id === productId;
  });

  if (existingItem) {
    existingItem.qty = existingItem.qty + 1;
  } else {
    cartItems.push({
      id: productId,
      qty: 1
    });
  }

  saveCart(cartItems);
  showToast(`تمت إضافة ${product.name} إلى السلة`);
}

/**
 * حذف منتج بالكامل من السلة وإعادة رسم صفحة السلة.
 */
function removeFromCart(productId) {
  const cartItems = readCart();
  const updatedCart = cartItems.filter(function (item) {
    return item.id !== productId;
  });

  saveCart(cartItems.length !== updatedCart.length ? updatedCart : cartItems);
  renderCart();
}

/**
 * تعديل كمية منتج في السلة بمقدار (+1 أو -1) بحد أدنى 1.
 */
function changeQty(productId, delta) {
  const cartItems = readCart();
  const targetItem = cartItems.find(function (item) {
    return item.id === productId;
  });

  if (targetItem) {
    const nextQuantity = targetItem.qty + delta;
    targetItem.qty = Math.max(1, nextQuantity);
  }

  saveCart(cartItems);
  renderCart();
}

/* --------------------------------------------------------------------------
   4. UI Notifications & Scroll Reveal
   -------------------------------------------------------------------------- */

/**
 * إظهار رسالة تنبيه مؤقتة (Toast) أسفل الشاشة.
 */
function showToast(message) {
  let toastElement = document.getElementById('toast');

  if (!toastElement) {
    toastElement = document.createElement('div');
    toastElement.id = 'toast';
    toastElement.style.cssText =
      'position:fixed;left:20px;bottom:20px;z-index:100;background:#191929;' +
      'border:1px solid #8b5cf6;padding:13px 18px;border-radius:10px;' +
      'box-shadow:0 5px 25px #0009';
    document.body.appendChild(toastElement);
  }

  toastElement.textContent = message;
  toastElement.style.display = 'block';

  clearTimeout(window.gzToastTimer);
  window.gzToastTimer = setTimeout(function () {
    toastElement.style.display = 'none';
  }, 2400);
}

/**
 * إظهار العناصر تدريجيًا عند التمرير إليها.
 */
function observeReveals() {
  const hiddenElements = document.querySelectorAll('.reveal:not(.visible)');

  if (!('IntersectionObserver' in window)) {
    hiddenElements.forEach(function (element) {
      element.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  hiddenElements.forEach(function (element) {
    observer.observe(element);
  });
}

/* --------------------------------------------------------------------------
   5. Product Card & Grid Rendering
   -------------------------------------------------------------------------- */

/**
 * إنشاء كود HTML لبطاقة منتج واحدة (اسم المنتج والشركة بالإنجليزية والأزرار بالعربية).
 */
function createProductCardHTML(product) {
  const encodedId = encodeURIComponent(product.id);
  const detailUrl = `product.html?id=${encodedId}`;
  const badgeText = product.tag || 'Featured';
  const brandLabel = product.brand || product.category;
  const ratingValue = product.rating || '4.8';
  const reviewCount = product.reviews || '12';
  const priceHtml = formatPrice(product.price);

  return `
    <article class="product-card reveal">
      <span class="badge">${badgeText}</span>
      <a class="product-image" href="${detailUrl}">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.src='${FALLBACK_IMAGE_URL}'"
        >
      </a>
      <div class="product-info">
        <div class="tag">${brandLabel}</div>
        <h3>
          <a href="${detailUrl}">${product.name}</a>
        </h3>
        <div class="rating">
          ★★★★★ <span>${ratingValue} (${reviewCount})</span>
        </div>
        <div class="price">${priceHtml}</div>
        <div class="card-actions">
          <button onclick="addToCart('${product.id}')">أضف للسلة</button>
          <a class="btn btn-outline" href="${detailUrl}">التفاصيل</a>
        </div>
      </div>
    </article>
  `;
}

/**
 * عرض قائمة المنتجات داخل العنصر المحدد في الصفحة.
 */
function renderProducts(targetSelector, productList) {
  const container = document.querySelector(targetSelector);

  if (!container) {
    return;
  }

  if (productList.length > 0) {
    const cardsHtml = productList.map(createProductCardHTML).join('');
    container.innerHTML = cardsHtml;
  } else {
    container.innerHTML = '<div class="empty-state">لا توجد منتجات تطابق بحثك.</div>';
  }

  observeReveals();
}

/* --------------------------------------------------------------------------
   6. Category Pages (Search, Brand Filter, Price Range, Sorting)
   -------------------------------------------------------------------------- */

/**
 * تفعيل البحث والتصفية حسب الشركة والسعر والترتيب في صفحات الأقسام.
 */
function initCategoryPage() {
  const productGrid = document.querySelector('#productGrid');

  if (!productGrid) {
    return;
  }

  const categoryName = productGrid.dataset.category;
  const allProducts = getAllProducts();
  const categoryProducts = allProducts.filter(function (product) {
    if (categoryName === 'all') {
      return true;
    }
    return product.category === categoryName;
  });

  const searchInput = document.querySelector('#searchProducts');
  const brandSelect = document.querySelector('#brandFilter');
  const sortSelect = document.querySelector('#sortProducts');
  const minPriceInput = document.querySelector('#minPrice');
  const maxPriceInput = document.querySelector('#maxPrice');

  // تعبئة قائمة الشركات المتوفرة في هذا القسم
  if (brandSelect) {
    const brandSet = new Set(
      categoryProducts.map(function (product) {
        return product.brand;
      })
    );
    const uniqueBrands = Array.from(brandSet);
    const brandOptions = uniqueBrands
      .map(function (brandName) {
        return `<option>${brandName}</option>`;
      })
      .join('');

    brandSelect.innerHTML = '<option value="">جميع الشركات</option>' + brandOptions;
  }

  /**
   * تطبيق البحث والفلاتر والترتيب عند تغيير أي مدخل.
   */
  function applyFiltersAndSort() {
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedBrand = brandSelect ? brandSelect.value : '';
    const minPrice = minPriceInput && minPriceInput.value !== '' ? Number(minPriceInput.value) : 0;
    const maxPrice = maxPriceInput && maxPriceInput.value !== '' ? Number(maxPriceInput.value) : Infinity;
    const sortMode = sortSelect ? sortSelect.value : 'featured';

    const filteredProducts = categoryProducts.filter(function (product) {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery);
      const matchesBrand = !selectedBrand || product.brand === selectedBrand;
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

      return matchesSearch && matchesBrand && matchesPrice;
    });

    if (sortMode === 'low') {
      filteredProducts.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (sortMode === 'high') {
      filteredProducts.sort(function (a, b) {
        return b.price - a.price;
      });
    } else if (sortMode === 'new') {
      filteredProducts.reverse();
    }

    renderProducts('#productGrid', filteredProducts);
  }

  const filterControls = [searchInput, brandSelect, sortSelect, minPriceInput, maxPriceInput];

  filterControls.forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFiltersAndSort);
    }
  });

  applyFiltersAndSort();
}

/* --------------------------------------------------------------------------
   7. Product Details Page
   -------------------------------------------------------------------------- */

/**
 * عرض تفاصيل المنتج المحدد بناءً على معرّف الرابط ?id=.
 */
function initProductDetailPage() {
  const detailContainer = document.querySelector('#productDetail');

  if (!detailContainer) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const requestedId = urlParams.get('id');
  const allProducts = getAllProducts();
  const product = findProductById(requestedId) || allProducts[0];

  if (!product) {
    detailContainer.innerHTML = '<div class="empty-state">المنتج غير موجود.</div>';
    return;
  }

  detailContainer.innerHTML = `
    <div class="two-col">
      <div>
        <img
          class="detail-image"
          src="${product.image}"
          alt="${product.name}"
          onerror="this.src='${FALLBACK_IMAGE_URL}'"
        >
      </div>
      <div>
        <div class="tag">${product.brand}</div>
        <h1 class="page-title">${product.name}</h1>
        <div class="rating">
          ★★★★★ <span>${product.rating} / 5 · ${product.reviews} تقييم</span>
        </div>
        <p class="detail-price">${formatPrice(product.price)}</p>
        <p class="muted">${product.desc}</p>
        <p><strong>الحالة:</strong> متوفر في المتجر (تجريبي)</p>
        <button onclick="addToCart('${product.id}')">أضف إلى السلة</button>
        <hr style="border-color: var(--line); margin: 25px 0">
        <h3>تقييمات العملاء</h3>
        <div class="review">
          <div class="rating">★★★★★</div>
          <strong>تجربة لعب ممتازة</strong>
          <p class="muted">جودة عالية وأداء رائع مطابق للتوقعات.</p>
        </div>
        <div class="review">
          <div class="rating">★★★★☆</div>
          <strong>منتج يستحق الاقتناء</strong>
          <p class="muted">خيار ممتاز لعشاق الألعاب الإلكترونية.</p>
        </div>
        <small class="muted">تقييمات تجريبية لأغراض العرض الجامعي.</small>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   8. Cart, Checkout & Order Confirmation Pages
   -------------------------------------------------------------------------- */

/**
 * عرض عناصر سلة التسوق والملخص المالي في صفحة cart.html.
 */
function renderCart() {
  const cartHost = document.querySelector('#cartItems');

  if (!cartHost) {
    return;
  }

  const summaryHost = document.querySelector('#cartSummary');
  const cartItems = readCart();

  if (cartItems.length === 0) {
    cartHost.innerHTML = `
      <div class="empty-state">
        <h3>سلة التسوق فارغة</h3>
        <p>تصفح تشكيلة الألعاب والأجهزة وأضف منتجك الأول.</p>
        <a class="btn" href="consoles.html">ابدأ التسوق</a>
      </div>
    `;
    summaryHost.innerHTML = '';
    return;
  }

  let totalUsd = 0;

  const rowsHtml = cartItems
    .map(function (cartItem) {
      const product = findProductById(cartItem.id);

      if (!product) {
        return '';
      }

      const lineSubtotal = product.price * cartItem.qty;
      totalUsd = totalUsd + lineSubtotal;

      return `
        <div class="cart-row">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <strong>${product.name}</strong>
            <div class="muted">${formatPrice(product.price)}</div>
            <button class="btn-outline btn-small" onclick="removeFromCart('${product.id}')">حذف</button>
          </div>
          <div class="qty">
            <button onclick="changeQty('${product.id}', -1)">−</button>
            <strong>${cartItem.qty}</strong>
            <button onclick="changeQty('${product.id}', 1)">+</button>
          </div>
          <strong class="line-total">${formatPrice(lineSubtotal)}</strong>
        </div>
      `;
    })
    .join('');

  cartHost.innerHTML = rowsHtml;

  summaryHost.innerHTML = `
    <div class="summary-line">
      <span>المجموع الفرعي</span>
      <strong>${formatPrice(totalUsd)}</strong>
    </div>
    <div class="summary-line">
      <span>التوصيل</span>
      <span>يُحسب عند إتمام الطلب</span>
    </div>
    <div class="summary-line total">
      <span>الإجمالي</span>
      <strong>${formatPrice(totalUsd)}</strong>
    </div>
    <a class="btn" style="width: 100%; margin-top: 15px" href="checkout.html">إتمام الطلب</a>
  `;
}

/**
 * تهيئة ملخص الطلب ونموذج إتمام الشراء في checkout.html.
 */
function initCheckoutPage() {
  const checkoutForm = document.querySelector('#checkoutForm');

  if (!checkoutForm) {
    return;
  }

  const summaryHost = document.querySelector('#checkoutSummary');
  const cartItems = readCart();

  if (cartItems.length === 0) {
    summaryHost.innerHTML =
      '<div class="empty-state">سلتك فارغة حاليًا. <a class="text-link" href="consoles.html">تسوّق الآن</a>.</div>';
    checkoutForm.style.display = 'none';
    return;
  }

  let totalUsd = 0;

  const summaryRowsHtml = cartItems
    .map(function (cartItem) {
      const product = findProductById(cartItem.id);
      const unitPrice = product ? product.price : 0;
      const productName = product ? product.name : cartItem.id;
      const lineTotal = unitPrice * cartItem.qty;

      totalUsd = totalUsd + lineTotal;

      return `
        <div class="summary-line">
          <span>${productName} × ${cartItem.qty}</span>
          <strong>$${lineTotal.toFixed(2)}</strong>
        </div>
      `;
    })
    .join('');

  summaryHost.innerHTML =
    summaryRowsHtml +
    `
      <div class="summary-line total">
        <span>الإجمالي</span>
        <strong>${formatPrice(totalUsd)}</strong>
      </div>
    `;

  checkoutForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!checkoutForm.reportValidity()) {
      return;
    }

    const formData = new FormData(checkoutForm);
    const customerInfo = Object.fromEntries(formData.entries());
    const orderNumber = 'GZ-' + Date.now().toString().slice(-8);

    const newOrder = {
      number: orderNumber,
      date: new Date().toLocaleString(),
      customer: customerInfo,
      items: cartItems,
      total: totalUsd
    };

    const existingOrdersRaw = localStorage.getItem(STORAGE_KEY_ORDERS) || '[]';
    const existingOrders = JSON.parse(existingOrdersRaw);

    existingOrders.push(newOrder);
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(existingOrders));
    localStorage.setItem(STORAGE_KEY_LAST_ORDER, JSON.stringify(newOrder));
    localStorage.removeItem(STORAGE_KEY_CART);

    window.location.href = 'order-success.html';
  });
}

/**
 * عرض تفاصيل آخر طلب مؤكد في صفحة order-success.html.
 */
function initOrderSuccessPage() {
  const successContainer = document.querySelector('#orderSuccess');

  if (!successContainer) {
    return;
  }

  const rawOrder = localStorage.getItem(STORAGE_KEY_LAST_ORDER) || 'null';
  const lastOrder = JSON.parse(rawOrder);

  if (!lastOrder) {
    successContainer.innerHTML =
      '<div class="empty-state">لا يوجد طلب حديث. <a class="text-link" href="index.html">العودة للرئيسية</a>.</div>';
    return;
  }

  const itemsHtml = lastOrder.items
    .map(function (orderItem) {
      const product = findProductById(orderItem.id);
      const productName = product ? product.name : orderItem.id;
      const lineTotal = (product ? product.price : 0) * orderItem.qty;

      return `
        <div class="summary-line">
          <span>${productName} × ${orderItem.qty}</span>
          <strong>$${lineTotal}</strong>
        </div>
      `;
    })
    .join('');

  successContainer.innerHTML = `
    <div class="success-box">
      <div class="success-icon">✓</div>
      <h1 class="page-title">تم تأكيد الطلب!</h1>
      <p>تم تسجيل طلبك التجريبي بنجاح.</p>
      <h2>${lastOrder.number}</h2>
      <p class="muted">${lastOrder.date}</p>
      <div class="panel" style="text-align: right; margin-top: 20px">
        <h3>ملخص الطلب</h3>
        ${itemsHtml}
        <div class="summary-line total">
          <span>الإجمالي</span>
          <strong>${formatPrice(lastOrder.total)}</strong>
        </div>
      </div>
      <a class="btn" href="index.html" style="margin-top: 20px">متابعة التسوق</a>
    </div>
  `;
}

/* --------------------------------------------------------------------------
   9. Admin Login & Dashboard
   -------------------------------------------------------------------------- */

/**
 * التحقق من بيانات دخول لوحة الإدارة في admin-login.html.
 */
function initAdminLoginPage() {
  const loginForm = document.querySelector('#adminLogin');

  if (!loginForm) {
    return;
  }

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const username = loginForm.username.value;
    const password = loginForm.password.value;
    const messageElement = document.querySelector('#loginMessage');

    if (username === 'admin' && password === 'Gamer@2026') {
      sessionStorage.setItem(SESSION_KEY_ADMIN, 'yes');
      window.location.href = 'admin.html';
    } else {
      messageElement.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة.';
    }
  });
}

/**
 * عرض وإدارة المنتجات والإحصائيات في لوحة الإدارة admin.html.
 */
function initAdminDashboard() {
  const adminRoot = document.querySelector('#adminRoot');

  if (!adminRoot) {
    return;
  }

  if (sessionStorage.getItem(SESSION_KEY_ADMIN) !== 'yes') {
    window.location.href = 'admin-login.html';
    return;
  }

  const allProducts = getAllProducts();
  const savedOrders = JSON.parse(localStorage.getItem(STORAGE_KEY_ORDERS) || '[]');

  const tableRowsHtml = allProducts
    .map(function (product) {
      const isCustomProduct = product.id.startsWith('custom-');
      const deleteButtonHtml = isCustomProduct
        ? `<button class="btn-small" style="background: #9d3048" onclick="deleteProduct('${product.id}')">حذف</button>`
        : '';

      return `
        <tr>
          <td>
            <img class="small-thumb" src="${product.image}" alt="">
            ${product.name}
          </td>
          <td>${product.category}</td>
          <td>$${product.price}</td>
          <td class="admin-actions">
            <button class="btn-small" onclick="editProduct('${product.id}')">تعديل</button>
            ${deleteButtonHtml}
          </td>
        </tr>
      `;
    })
    .join('');

  adminRoot.innerHTML = `
    <div class="section-head">
      <div>
        <h2>إدارة المنتجات</h2>
        <p class="muted">لوحة تحكم تجريبية · التغييرات تُحفظ داخل هذا المتصفح.</p>
      </div>
      <button onclick="adminLogout()" class="btn-outline">تسجيل الخروج</button>
    </div>

    <div class="two-col">
      <form id="productForm" class="panel">
        <h3 id="formHeading">إضافة منتج جديد</h3>
        <input type="hidden" name="id">

        <div class="field">
          <label>اسم المنتج (بالإنجليزية)</label>
          <input name="name" required>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>الفئة</label>
            <select name="category">
              <option value="consoles">Consoles</option>
              <option value="gaming-pcs">Gaming PCs</option>
              <option value="games">Games</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
          <div class="field">
            <label>الشركة المصنعة</label>
            <input name="brand" required>
          </div>
        </div>

        <div class="form-grid">
          <div class="field">
            <label>السعر (USD)</label>
            <input name="price" type="number" min="1" required>
          </div>
          <div class="field">
            <label>رابط الصورة</label>
            <input name="image" type="url" placeholder="https://...">
          </div>
        </div>

        <div class="field">
          <label>الوصف</label>
          <textarea name="desc"></textarea>
        </div>

        <button type="submit">حفظ المنتج</button>
        <button type="button" class="btn-outline" onclick="resetProductForm()">مسح</button>
      </form>

      <div class="panel">
        <h3>نظرة عامة على المتجر</h3>
        <div class="summary-line">
          <span>إجمالي المنتجات</span>
          <strong>${allProducts.length}</strong>
        </div>
        <div class="summary-line">
          <span>الطلبات المحفوظة</span>
          <strong>${savedOrders.length}</strong>
        </div>
        <p class="muted">
          المنتجات الأساسية جزء من بيانات المشروع، ويمكنك تعديلها أو إضافة وحذف منتجات مخصصة من هنا.
        </p>
      </div>
    </div>

    <div class="panel" style="margin-top: 25px">
      <h3>قائمة المنتجات</h3>
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الفئة</th>
              <th>السعر</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const productForm = document.querySelector('#productForm');
  productForm.addEventListener('submit', saveProduct);
  window.gzEditingProducts = allProducts;
}

/**
 * إعادة تعيين نموذج المنتج إلى وضع الإضافة.
 */
function resetProductForm() {
  const productForm = document.querySelector('#productForm');
  const idInput = document.querySelector('#productForm [name=id]');
  const heading = document.querySelector('#formHeading');

  if (productForm) {
    productForm.reset();
  }

  if (idInput) {
    idInput.value = '';
  }

  if (heading) {
    heading.textContent = 'إضافة منتج جديد';
  }
}

/**
 * حفظ منتج جديد أو تعديل منتج حالي في localStorage.
 */
function saveProduct(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const inputValues = Object.fromEntries(formData.entries());
  const customProducts = getCustomProducts();

  const productId = inputValues.id || 'custom-' + Date.now();
  const existingProduct = findProductById(productId);

  const productRecord = {
    id: productId,
    name: inputValues.name,
    category: inputValues.category,
    brand: inputValues.brand,
    price: Number(inputValues.price),
    old: existingProduct ? existingProduct.old : undefined,
    rating: existingProduct ? existingProduct.rating : 4.8,
    reviews: existingProduct ? existingProduct.reviews : 0,
    tag: existingProduct ? existingProduct.tag : 'Admin Added',
    image: inputValues.image || FALLBACK_IMAGE_URL,
    desc: inputValues.desc
  };

  const existingIndex = customProducts.findIndex(function (item) {
    return item.id === productId;
  });

  if (existingIndex >= 0) {
    customProducts[existingIndex] = productRecord;
  } else {
    customProducts.push(productRecord);
  }

  localStorage.setItem(STORAGE_KEY_CUSTOM_PRODUCTS, JSON.stringify(customProducts));
  initAdminDashboard();
  showToast('تم حفظ المنتج بنجاح');
}

/**
 * تعبئة نموذج الإدارة ببيانات المنتج المراد تعديله.
 */
function editProduct(productId) {
  const product = findProductById(productId);

  if (!product) {
    return;
  }

  const productForm = document.querySelector('#productForm');
  const heading = document.querySelector('#formHeading');
  const fieldNames = Object.keys(product);

  fieldNames.forEach(function (fieldName) {
    if (productForm.elements[fieldName]) {
      productForm.elements[fieldName].value = product[fieldName];
    }
  });

  productForm.elements.id.value = product.id;
  heading.textContent = 'تعديل المنتج';

  window.scrollTo({
    top: productForm.offsetTop - 100,
    behavior: 'smooth'
  });
}

/**
 * حذف منتج مخصص من localStorage بعد تأكيد المستخدم.
 */
function deleteProduct(productId) {
  const confirmed = confirm('هل تريد حذف هذا المنتج المخصص؟');

  if (!confirmed) {
    return;
  }

  const customProducts = getCustomProducts();
  const remainingProducts = customProducts.filter(function (product) {
    return product.id !== productId;
  });

  localStorage.setItem(STORAGE_KEY_CUSTOM_PRODUCTS, JSON.stringify(remainingProducts));
  initAdminDashboard();
}

/**
 * تسجيل الخروج من لوحة الإدارة والعودة لصفحة تسجيل الدخول.
 */
function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY_ADMIN);
  window.location.href = 'admin-login.html';
}

/* --------------------------------------------------------------------------
   10. Contact Form & Global Initialization
   -------------------------------------------------------------------------- */

/**
 * تفعيل نموذج التواصل التجريبي في صفحة contact.html.
 */
function initContactPage() {
  const contactForm = document.querySelector('#contactForm');

  if (!contactForm) {
    return;
  }

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const messageElement = document.querySelector('#contactMessage');
    messageElement.textContent = 'شكرًا لك! تم تسجيل رسالتك التجريبية في هذه الصفحة.';
    contactForm.reset();
  });
}

/**
 * تهيئة قائمة الهاتف وتشغيل دوال الصفحة عند تحميل المستند.
 */
document.addEventListener('DOMContentLoaded', function () {
  updateCartCount();

  const menuToggleButton = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggleButton && navLinks) {
    menuToggleButton.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  initCategoryPage();
  renderCart();
  initCheckoutPage();
  initProductDetailPage();
  initAdminLoginPage();
  initAdminDashboard();
  initContactPage();
  initOrderSuccessPage();
  observeReveals();
});
