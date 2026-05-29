# SmartCommerce - Full-Stack MERN E-commerce Engine

SmartCommerce is a modern, high-performance e-commerce platform built on the MERN stack (MongoDB, Express, React, Node.js). Designed as a premium shopping engine inspired by Amazon and Flipkart, it features secure JWT authentication, multi-criteria catalog searches, dynamic review aggregates, wishlists, shopping carts, and automated Razorpay payments verification.

The codebase is structured to serve as a robust, scalable foundation, preparing you for seamless integrations of future AI capabilities (such as search vector embeddings, recommendation engines, and customer support bots).

---

## 🚀 Key Features

### 🔐 Security & Access Controls
- **JWT Session Security**: Secure API endpoints guarded by custom JSON Web Token parsing middlewares.
- **Bcrypt Hashing**: User credentials securely encrypted using pre-save hashing hooks.
- **Administrative Roles**: Strict routing guards separating Customer pages from Admin tools.

### 📦 Robust Database Collections (Mongoose)
- **Advanced Product Catalog**: Supports text indexing, pricing validations, stock levels, and embedded specifications array.
- **Dynamic Rating Aggregations**: Review submissions automatically compute and cache product average ratings.
- **Shopping Cart & Wishlist**: Real-time local state synchronization persisting to the database, supporting granular quantity edits and wishlist saves.
- **Transactions Snapshots**: Capture static item prices at checkout to insulate against future pricing changes.

### 💳 Promo Coupons, Address book & Save for Later
- **Dynamic Promo Coupon Engine**: Fully functional coupon code validations (`WELCOME10`, `FLAT500`) checking active status, minimum thresholds, and calendars, with automatic calculation at checkout.
- **Saved Address Book**: Support for multiple shipping address entries per user with instant default toggles and single-click checkout pre-population.
- **"Save for Later" Cart Integrations**: Complete Amazon-style cart integrations allowing users to save items for later (moving to wishlist and removing from active cart) and move them back to the active cart with a single click.
- **Comprehensive Checkout Portal**: A high-performance screen combining visual item summaries, promo code selectors, payment method grids (secure COD or Razorpay overlays), a "+ Enter New Address" card to wipe and clear input forms instantly, and optional auto-saving profile checkboxes to save newly typed shipping addresses on successful order submission.
- **Premium Celebratory Success Receipts**: A dedicated `/checkout/success` page displaying successful order IDs, exact total amount paid breakdowns, estimated delivery calendar timelines (3-5 business days), and address snapshots.
- **Fail-Safe Payment Recovery Warning Cards**: Custom dismissible rose warning cards displaying error details and offering single-click Cash on Delivery (COD) switches when payments decline.

### 🛍 Discover & Curated Homepage Experience
- **Interactive Promo Carousel**: Rotating promotional banners linking directly to product category directory views.
- **Discovery Feeds**: Structured homepage rendering "Featured Collections" ($rating \geq 4$), "Trending Hot Deals" (discounted prices), "New Arrivals", and "Recently Viewed Products" loaded from client local storage history.
- **Navbar Auto-Complete Search**: Real-time 300ms debounced search suggestion panels displaying matching brand badges, image thumbnails, and pricing.

### 🔍 Advanced Filter Sidebar & Sorting
- **Refinement Controls**: Multi-layered search filtering options including category buttons, gold-star rating thresholds, stock availability status, and customizable price boundaries.
- **Sort Priorities**: Sort lists instantly by Price: Low to High, Price: High to Low, Newest First, Best Rated, or Most Popular.

### 🧮 Comprehensive Price & Inclusive Tax Math
- **Inclusive Tax**: Computes and displays **Estimated GST (18% Included)** using the standard retail tax formula: `Subtotal - (Subtotal / 1.18)`.
- **Dynamic Shipping Logic**: Appends a flat **₹99** delivery fee for net subtotals below ₹1000, displaying an incentive text showing remaining spend for **FREE Delivery** (for orders ₹1000 & above).
- **Backend Sync Verification**: Recalculates and validates pricing totals server-side during checkout creation to match payment gateway sessions and database logs flawlessly.

### 🛠 Administrative Control Center
- **Product Inventory Manager**: Complete CRUD workspace with dynamic specifications key-value fields.
- **Category Creator**: Create product directories with direct Cloudinary uploads.
- **Global Order Tracker**: Edit global dispatch statuses (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) using dropdown controls color-coded to custom themes.

### 📦 Order Management & Printable Invoices
- **Milestone Order Flow Tracking**: Integrated the `Confirmed` stage into the order lifecycle: `Pending ➡️ Confirmed ➡️ Processing ➡️ Shipped ➡️ Delivered` with matching timeline indicators.
- **Secure Self-Service Cancellations**: Customers can securely cancel their own orders if they are still in `Pending` or `Confirmed` status. The system automatically restocks product database inventory levels and marks payment statuses as `Refunded` for Razorpay transactions.
- **Printable Cash Memo Invoices**: Custom printable receipt route (`/orders/:id/invoice`) display item descriptions, 18% inclusive GST rates, shipping rates, and savings. Leverages specialized printing CSS media directives (`@media print`) to strip navbars, footers, buttons, and trigger the native browser print menu (`window.print()`) instantly on mount.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Axios, Context API, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas, Mongoose
- **Image Cloud Storage**: Cloudinary SDK
- **Payment Processing**: Razorpay Gateway Integration

---

## 📂 Codebase Directory Layout

```
AI-Smart-Commerce/
├── server/                        # Node.js + Express.js API
│   ├── config/                    # Mongoose, Cloudinary & Razorpay configurations
│   ├── controllers/               # API route handlers
│   ├── middleware/                # Protect routers, admin checks, and file uploads
│   ├── models/                    # MongoDB schemas
│   ├── routes/                    # API routes
│   ├── seed.js                    # Mock database seeder
│   └── server.js                  # Main server entrypoint
│
└── client/                        # React SPA (Vite + Tailwind)
    ├── src/
    │   ├── components/            # Headers, Footers, ProductCards, ReviewForms
    │   ├── context/               # State providers (Auth, Shop, Cart)
    │   ├── pages/                 # Home, Detail Sheets, Carts, Orders, Admins
    │   ├── routes/                # Router mapping (AppRoutes.jsx)
    │   └── services/              # Centralized Axios client (api.js)
    ├── tailwind.config.js         # Tailwind design system configurations
    └── postcss.config.js          # PostCSS configuration
```

---

## ⚙️ Configuration & Setup

### 1. Server Configuration
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-smart-commerce?retryWrites=true&w=majority
JWT_SECRET=your_jwt_signing_key_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Client Configuration
Create a `.env` file inside the `client/` directory:
```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
# Install backend packages
cd server
npm install

# Install frontend packages
cd ../client
npm install --legacy-peer-deps
```

### 2. Seed Mock Database Data
Pre-populate users, products, categories, and reviews:
```bash
cd server
node seed.js
```
*Creates default accounts:*
- **Customer login**: `customer@example.com` / `password123`
- **Admin login**: `admin@example.com` / `password123`

### 3. Start Development Servers
```bash
# In server/ directory
npm run dev

# In client/ directory
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔮 Roadmap: Future AI Capabilities

This codebase has been built with clean modular separation of concerns, providing direct integration paths for the upcoming AI Smart features:
1. **AI Semantic Search**: Set up Mongoose middleware to automatically generate Vector Embeddings on Product creations for semantic relevance search.
2. **AI Recommendation Engine**: Feed the structured `Reviews`, `Cart`, and `Wishlist` collections data into collaborative filtering models to display personalized recommendations.
3. **AI Chatbot Shopping Assistant**: An interface hooks setup inside `Navbar.jsx` to mount a conversational chat overlay that acts as a customer helper.
