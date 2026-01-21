# Vehicle Rental System (Backend)

## 📌 Project Overview
The **Vehicle Rental System** is a robust backend API designed to manage vehicle rentals efficiently. It handles user authentication, vehicle inventory management, and booking processes with strict role-based access control (RBAC). Built with modern web technologies, it ensures data integrity, secure transactions, and a seamless flow for both Admins and Customers.

**Live Deployment:** [Live Link](https://vehiclerentalsystem-iota.vercel.app/)
**GitHub Repository:** [GitHub Repo](https://github.com/wasif23ahad/vehicleRentalSystem)

---
## 🚀 Features

*   **Authentication & Authorization**:
    *   Secure User Registration & Login (Admin/Customer).
    *   JWT-based session management.
    *   Role-Based protection for sensitive routes.
*   **Vehicle Management** (Admin Only):
    *   Add, Update, and Delete vehicles.
    *   Real-time availability tracking.
*   **Booking System**:
    *   Overlap detection to prevent double-booking.
    *   Automatic total price calculation based on rental duration.
    *   Vehicle status updates upon booking creation and return.
*   **User Management**:
    *   Admins can view and manage all users.
    *   Customers can manage their own profiles.
*   **Database**:
    *   Relational schema with PostgreSQL.
    *   Automated table initialization on server start.

---

## 🛠 Technology Stack

*   **Runtime Environment**: Node.js
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database**: PostgreSQL (via Neon DB)
*   **ORM/Driver**: node-postgres (`pg`)
*   **Authentication**: JSON Web Token (JWT) & Bcrypt

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally.

### 1. Prerequisities
*   Node.js installed (v16+)
*   PostgreSQL database (Local or Cloud like Neon/Supabase)

### 2. Clone the Repository
```bash
git clone <repository_url>
cd Vehicle_Rental_System
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configuration
Create a `.env` file in the root directory and add your credentials:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=1d
```

### 5. Running the Application
**Development Mode:**
```bash
npm run dev
```
*The server will start on port 5000 and automatically initialize the database tables.*

**Production Build:**
```bash
npm run build
npm start
```

---

## 📖 API Documentation

The API follows RESTful principles. Below is a summary of key endpoints.

### Auth
*   `POST /api/v1/auth/signup` - Register a new user
*   `POST /api/v1/auth/signin` - Login

### Vehicles
*   `GET /api/v1/vehicles` - Get all vehicles
*   `POST /api/v1/vehicles` - Create vehicle (Admin)
*   `PUT /api/v1/vehicles/:id` - Update vehicle (Admin)
*   `DELETE /api/v1/vehicles/:id` - Delete vehicle (Admin)

### Bookings
*   `POST /api/v1/bookings` - Create a booking (Customer)
*   `GET /api/v1/bookings` - Get my bookings (Customer) / All bookings (Admin)
*   `PUT /api/v1/bookings/:id` - Return/Cancel booking

---

## 📂 Project Structure

```
src/
├── config/         # Database configuration & initialization
├── middlewares/    # Auth, Validation, & Error handling
├── modules/        # Feature-based modules (Controller, Service, Route)
│   ├── auth/
│   ├── bookings/
│   ├── users/
│   └── vehicles/
├── scripts/        # SQL scripts & Migrations
├── types/          # TypeScript definitions
└── utils/          # Helper functions (Date, Number, JWT)
```

---

**Developed for Assignment 2 Submission.**

## Author

**Mohammad Wasif Ahad**

**GitHub:** [wasif23ahad](https://github.com/wasif23ahad)

**LinkedIn:** [wasif23ahad](https://www.linkedin.com/in/wasif23ahad/)
