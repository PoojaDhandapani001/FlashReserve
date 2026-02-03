# FlashReserve API

FlashReserve is a high-performance backend service designed for a flash-sale marketplace.  
It focuses on **high-concurrency inventory reservation**, ensuring correctness under race conditions while supporting temporary reservations with automatic expiry.

---

## 🚀 Tech Stack

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **Redis** (BullMQ for background jobs)
- **JWT Authentication** (Cookie + Authorization Header)
- **Docker & Docker Compose**
- **Swagger (OpenAPI 3.0)**

---

## 🧠 Core Features

- JWT-based authentication (cookie-based, with Bearer token support)
- Role-based access control (Admin, Customer)
- Atomic stock reservation under high concurrency
- Temporary reservations with automatic expiry (10 minutes)
- Background job processing using BullMQ
- Clean layered architecture

---

## 🏗 Architecture Overview

- **API Service**
  - Handles authentication, product listing, reservation, and checkout
- **Worker Service**
  - Processes reservation expiry jobs
  - Restores stock when reservations expire
- **Redis**
  - Used for job queue and delayed processing
- **MongoDB**
  - Stores users, products, and reservations

Each service runs independently and can be scaled horizontally.

---

## 🔐 Authentication & Authorization

- JWT is issued on login
- Token can be provided via:
  - HTTP-only Cookie (`token`)
  - `Authorization: Bearer <token>` header
- Roles:
  - **Admin** → Manage products
  - **Customer** → Reserve and purchase products

---

## 📦 Inventory & Reservation Flow

1. Admin adds a product with a fixed `stockQuantity`
2. Customers reserve a product:
   - Stock is **atomically decremented**
   - Reservation expires after **10 minutes**
3. If checkout is not completed:
   - Background worker marks reservation as `EXPIRED`
   - Stock is returned
4. Checkout confirms the reservation permanently

---

## ⚙️ Concurrency Control (Important)

Atomicity is guaranteed using MongoDB conditional updates:

```js
Product.findOneAndUpdate(
  { _id: productId, stockQuantity: { $gt: 0 } },
  { $inc: { stockQuantity: -1 } }
);
