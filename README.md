# GAMER ZONE — E-commerce Website

A multi-page university project built with **HTML, CSS and JavaScript**. Each page is a separate HTML file. The CSS and JavaScript are shared in their own folders.

## Run in Visual Studio Code
1. Extract `GAMER_ZONE.zip`.
2. Open Visual Studio Code.
3. Choose **File → Open Folder** and select the `GAMER_ZONE` folder.
4. Open `index.html`.
5. Recommended: install the **Live Server** extension, right-click `index.html`, then choose **Open with Live Server**. You can also open `index.html` directly in a browser.

## Pages
- `index.html` — Home page
- `consoles.html` — Consoles
- `gaming-pcs.html` — Gaming PCs
- `games.html` — Video games
- `accessories.html` — Accessories
- `offers.html` — Offers
- `product.html` — Product details (uses `?id=product-id`)
- `cart.html` — Shopping cart
- `checkout.html` — Checkout form
- `order-success.html` — Order confirmation
- `about.html` — About the store
- `contact.html` — Contact form and contact information
- `admin-login.html` — Demo admin login
- `admin.html` — Product management dashboard

## Demo admin login
- Username: `admin`
- Password: `Gamer@2026`

## Important project notes
- Cart, custom products and demo orders are saved with the browser's `localStorage`.
- Admin login is intentionally a front-end demonstration. It is **not secure authentication**.
- Checkout is a demo. It does not process real payments, send orders to a server, or contact a delivery company.
- The contact form shows a local confirmation only; it does not send an email.
- The product reviews and catalog are sample/demo content.
- The sample USD/YER exchange rate is in `js/main.js`, in the line `const GZ_RATE = 520;`. Change `520` to update the displayed YER estimates. This is an illustrative value, not a live exchange rate.
- Product catalog data is in `js/products.js`. Product images are loaded from external image URLs, so an internet connection is needed to display them. A fallback image appears if an image fails.

## Folder structure
```text
GAMER_ZONE/
├── index.html
├── consoles.html
├── gaming-pcs.html
├── games.html
├── accessories.html
├── offers.html
├── product.html
├── cart.html
├── checkout.html
├── order-success.html
├── about.html
├── contact.html
├── admin-login.html
├── admin.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── products.js
│   └── home.js
└── README.md
```

## Viva / discussion: key concepts
- **HTML:** semantic page structure, forms, links, tables and input validation.
- **CSS:** shared stylesheet, CSS variables, grid/flex layouts, responsive media queries, hover effects and animations.
- **JavaScript:** rendering product cards, searching, filtering, sorting, cart quantity updates and checkout validation.
- **localStorage:** keeps cart contents, custom products and demo orders in the same browser.
- **Separate pages:** every main section has its own HTML file, while shared CSS/JS avoid repeating the same code.

## Suggested demonstration order
1. Open the home page and explain the navigation.
2. Open a category page and demonstrate search, brand filter, price range and sorting.
3. Open product details and add a product to the cart.
4. Change quantity or remove a product in the cart.
5. Complete the checkout form and show the order confirmation.
6. Open Admin, log in, add a custom product and explain browser storage.
