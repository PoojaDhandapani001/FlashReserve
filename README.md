# FlashReserve – High Concurrency Reservation API

FlashReserve is a backend service designed to handle high-concurrency, limited-stock reservations for a flash-sale marketplace. The system ensures correct stock handling under race conditions, supports temporary reservations with automatic expiry, and cleanly separates synchronous API logic from asynchronous background processing.

This project was implemented as part of a Senior Backend Engineer technical assessment.

---

## Tech Stack

- **Node.js** (Express)
- **MongoDB** (Mongoose)
- **Redis**
- **BullMQ** (background jobs)
- **JWT Authentication**
- **Swagger** (OpenAPI documentation)
- **Docker** (Redis and optional MongoDB)

---

## Core Features

### Authentication & Authorization
- JWT-based authentication
- Tokens are validated on protected routes
- Role-based access control:
  - **Admin**: create and manage products
  - **Customer**: reserve and purchase products

### Product Management
- Admin API to create products with:
  - `name`
  - `price`
  - `stockQuantity`
- Public API to list available products

### Atomic Reservation Logic
- Customers can reserve a product for **10 minutes**
- Stock is **decremented immediately** at reservation time
- Reservation creation and stock decrement are handled atomically
- If stock is unavailable, the reservation fails safely

### Reservation Expiry Handling
- Reservation expiry is handled asynchronously using **BullMQ**
- A delayed job is scheduled at reservation time
- If the reservation is not confirmed within 10 minutes:
  - Reservation status is marked as `EXPIRED`
  - Stock is restored back to the product

### Checkout / Purchase Confirmation
- Customers can confirm a reservation before expiry
- Successful confirmation marks the reservation as `CONFIRMED`
- Expired or invalid reservations cannot be confirmed

---

## Architecture Overview

This service follows a layered architecture:

- **Routes**: HTTP endpoints and request validation
- **Controllers**: Request handling and response formatting
- **Services**: Business logic (reservation, checkout, concurrency handling)
- **Models**: MongoDB schemas
- **Workers**: Background job processing (reservation expiry)

Background jobs are intentionally handled in a **separate worker process**, which reflects real-world production architecture and allows the API to scale independently from asynchronous processing.

---

## Concurrency Control Strategy

To prevent race conditions (e.g., 100 users reserving the last item):

- Stock decrement uses a **conditional atomic update** in MongoDB:
  - The product is updated only if `stockQuantity > 0`
- If the update fails, the reservation is rejected with a conflict error
- This guarantees that only one reservation can succeed when stock is limited

This approach avoids in-memory locking and works correctly across multiple instances.

---

## Reservation Expiry Strategy

- A delayed BullMQ job is created at reservation time
- Redis is used as the queue backend
- When the job executes:
  - The reservation is marked `EXPIRED` if still pending
  - Stock is restored back to the product

This ensures stock consistency even if the API restarts.

---

## Running the Project Locally

The application is not deployed publicly and is intended to be run locally.

### Prerequisites

Make sure you have the following installed:

- Node.js (v18+ recommended)
- Docker
- Git

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/PoojaDhandapani001/FlashReserve.git
cd FlashReserve
```
### Step 2: Install Dependencies

- Install project dependencies:

```bash
npm install
```

- Install concurrently as a dev dependency to run multiple processes:
```bash

npm install --save-dev concurrently
```

### Step 3: Environment Configuration

Create a .env file in the project root with the following content:
```javascript
PORT=3000

MONGO_URI=mongodb://localhost:27017/flashreserve
JWT_SECRET=your_jwt_secret

REDIS_HOST=localhost
REDIS_PORT=6379
```


Replace MONGO_URI if you are using MongoDB Atlas.

Step 4: Create Docker Compose File for Redis and MongoDB

Create a docker-compose.yml file in the project root:

```javascript
version: "3.9"

services:
  redis:
    image: redis:7
    ports:
      - "6379:6379"

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
```


Start the containers:
```bash
docker-compose up -d
```


Verify they are running:
```bash
docker ps
```

Step 5: Run the Application

Start the main API server and background worker:
```bash

npm run dev
```


This command runs both the main API server and the background worker process in parallel using concurrently.

Alternatively, you can run them separately:

Terminal 1:
```bash
npm run start
```


Terminal 2:
```bash
npm run worker
```

Step 6: Access Swagger API Documentation

Once the server is running:

http://localhost:3000/api-docs


## Swagger API Documentation
The API is fully documented via Swagger, providing an interactive interface to explore the system.

* **Interactive Docs:** Full API documentation at your fingertips.
* **Data Models:** Detailed Request/Response schemas.
* **Security:** Native Authorization support for secured endpoints.
* **Sandbox:** Built-in API testing support.

---

## 🧪 Testing the APIs (Suggested Flow)
Follow this sequence to test the end-to-end reservation logic:

-  **1. Register a user** `POST /auth/register`
-  **2. Login** `POST /auth/login`  
  > **Note:** Copy the `JWT token` from the response for subsequent steps.
-  **3. Create a product (Admin only)** `POST /products`  
  *Header:* `Authorization: Bearer <token>`
-  **4. List products** `GET /products`
-  **5. Reserve a product** `POST /reservations/:productId`  
  *Result:* You will receive a `reservationId`.
-  **6. Confirm purchase** `POST /reservations/confirm/:reservationId`
-  **7. Expiry Test** Wait **10 minutes** without confirming; the BullMQ worker will automatically restore the stock.

---

## Scaling Considerations (10,000 RPS)
To handle production-grade traffic spikes (10k+ Requests Per Second), the system is designed to scale horizontally:

| Component | Strategy |
| :--- | :--- |
| **API Layer** | Run multiple instances behind a Load Balancer (Nginx/AWS ELB). |
| **Background Jobs** | Spin up multiple BullMQ workers for parallel expiration handling. |
| **State & Locking** | Redis serves as the centralized queue and lock coordinator. |
| **Database** | Scale MongoDB via replica sets (HA) and sharding (Data Volume). |
| **Architecture** | Completely Stateless API design ensures seamless horizontal scaling. |

## Notes

The worker process must be running for reservation expiry to function

This is an intentional design choice and mirrors real production systems

The worker is designed to be independently deployable and scalable

## Conclusion

FlashReserve demonstrates handling of high-concurrency reservations, clean separation of concerns, and reliable background processing using Redis and BullMQ. The design prioritizes correctness, scalability, and production-ready patterns over simplistic in-process solutions.