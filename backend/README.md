# 🌿 GreenNest — Full Stack Application

A plant e-commerce web app built with **React (Vite)** on the frontend and **Spring Boot + MySQL** on the backend.

---

## 📁 Project Structure

```
GreenNest/
├── greennest-backend/          ← Spring Boot REST API
│   ├── pom.xml
│   └── src/main/java/com/greennest/
│       ├── config/             ← JWT, Security, Data Seeder
│       ├── controller/         ← REST Controllers
│       ├── dto/                ← Request/Response objects
│       ├── exception/          ← Global error handling
│       ├── model/              ← JPA Entities
│       ├── repository/         ← Spring Data JPA
│       └── service/            ← Business logic
│
└── GreenNest-Frontend-Improved/  ← React + Vite frontend
    └── src/
        ├── api.js              ← Axios-style fetch client
        ├── styles.css          ← Full design system
        └── components/
            ├── App.jsx
            ├── Header.jsx
            ├── HeroSection.jsx  ← Auth form (login/register)
            ├── PlantCard.jsx
            ├── PlantSection.jsx ← Fetches from API, fallback data
            ├── TestimonialSection.jsx
            └── Footer.jsx
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.8+ |
| MySQL | 8.0+ |
| Node.js | 18+ |
| npm | 9+ |

---

## 🗄️ MySQL Setup

```sql
-- Run in MySQL Workbench or CLI
CREATE DATABASE greennest_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'greennest'@'localhost' IDENTIFIED BY 'GreenNest@123';
GRANT ALL PRIVILEGES ON greennest_db.* TO 'greennest'@'localhost';
FLUSH PRIVILEGES;
```

Or simply use **root** and update `application.properties`.

---

## 🚀 Backend Setup

### 1. Configure database credentials

Edit `greennest-backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/greennest_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 2. Build and run

```bash
cd greennest-backend
mvn clean install
mvn spring-boot:run
```

The server starts at **https://greennest-production.up.railway.app**

### 3. On first startup

The `DataInitializer` automatically seeds:
- ✅ 9 products (3 indoor, 3 outdoor, 3 tools)
- ✅ Admin user: `admin@greennest.com` / `Admin@123`
- ✅ 3 approved testimonials

---

## 🌐 Frontend Setup

```bash
cd GreenNest-Frontend-Improved
npm install
npm run dev
```

App runs at **http://localhost:5173**

> **Note:** The frontend works even without the backend running — it falls back to hardcoded sample data so the UI is always visible.

---

## 🔑 API Endpoints

### Auth (Public)
| Method | URL | Body |
|--------|-----|------|
| POST | `/api/auth/register` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |

**Response:**
```json
{
  "token": "eyJhbGci...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "CUSTOMER"
}
```

### Products (Public)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/products` | All active products |
| GET | `/api/products?category=INDOOR_PLANT` | Filter by category |
| GET | `/api/products?search=rose` | Search products |
| GET | `/api/products/{id}` | Single product |

Categories: `INDOOR_PLANT`, `OUTDOOR_PLANT`, `GARDENING_TOOL`

### Cart (🔒 Requires JWT)
| Method | URL | Body |
|--------|-----|------|
| GET | `/api/cart` | — |
| POST | `/api/cart/add` | `{ productId, quantity }` |
| PUT | `/api/cart/update/{itemId}` | `{ quantity }` |
| DELETE | `/api/cart/remove/{itemId}` | — |

### Orders (🔒 Requires JWT)
| Method | URL | Body |
|--------|-----|------|
| POST | `/api/orders/checkout` | `{ shippingAddress }` |
| GET | `/api/orders` | User's order history |
| GET | `/api/orders/{id}` | Single order |

### Testimonials
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/testimonials` | Public |
| POST | `/api/testimonials` | 🔒 User |
| GET | `/api/testimonials/all` | 🔒 Admin |
| PATCH | `/api/testimonials/{id}/approve` | 🔒 Admin |

### Admin (🔒 ADMIN role)
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Soft-delete product |
| PATCH | `/api/orders/{id}/status` | Update order status |

---

## 🔐 Authentication

The API uses **JWT Bearer tokens**. After login/register, include the token in all protected requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

The frontend `src/api.js` handles this automatically by reading from `localStorage`.

---

## 🎨 UI Improvements Made

| Before | After |
|--------|-------|
| No prices shown | Price displayed on every card |
| Plain "Plant Now" button | "Add to Basket" with stock indicator |
| Static hardcoded data | Fetches from Spring Boot API |
| No auth feedback | Toast notifications for all actions |
| No loading state | Skeleton loading cards |
| Basic login form | Toggle between Login / Sign Up |
| No user state | Logged-in greeting + logout button |
| Generic fonts | Playfair Display + DM Sans |
| Flat card design | Hover animations, wishlist button, tags |
| Simple footer | Separate newsletter section + legal links |

---

## 🗃️ Database Schema (Auto-created by Hibernate)

```
users          → id, name, email, password, role, created_at
products       → id, name, description, price, category, image_url, stock, is_active
product_tags   → product_id, tag
carts          → id, user_id, updated_at
cart_items     → id, cart_id, product_id, quantity
orders         → id, user_id, total_price, status, shipping_address, created_at
order_items    → id, order_id, product_id, quantity, price_at_purchase
testimonials   → id, user_id, quote, rating, is_approved, created_at
```

---

## 🧪 Quick Test with curl

```bash
# Register
curl -X POST https://greennest-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"pass123"}'

# Get products
curl https://greennest-production.up.railway.app/api/products

# Add to cart (replace TOKEN)
curl -X POST https://greennest-production.up.railway.app/api/cart/add \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

---

## 📦 Tech Stack

**Backend**
- Spring Boot 3.2
- Spring Security + JWT (jjwt 0.11.5)
- Spring Data JPA + Hibernate
- MySQL 8
- Lombok
- Maven

**Frontend**
- React 17
- Vite 5
- Google Fonts (Playfair Display + DM Sans)
- Vanilla CSS (no UI library)
- Fetch API (custom `api.js` client)
