# 🎓 Viva & Troubleshooting Guide

This guide is designed to help you explain the project during your internship viva and fix common issues.

---

## 🛠 Troubleshooting Common Issues

### 1. `ModuleNotFoundError` (Missing Libraries)
- **Problem**: "No module named 'sqlalchemy'" or similar errors.
- **Fix**: Ensure your virtual environment (`venv`) is **activated**. Look for `(venv)` in your terminal prompt. If it's not there, run `.\venv\Scripts\activate`.

### 2. Login Fails (Invalid Email/Password)
- **Problem**: You try to login but get an error.
- **Fix**: 
  - Check if `shopsphere.db` exists in the `backend` folder.
  - If not, start the backend with `uvicorn`; it will automatically create the database and the admin user.
  - Use the exact credentials: `admin@shopsphere.com` / `Admin@123`.

### 3. Database is Locked (`OperationalError`)
- **Problem**: "database is locked" error in the terminal.
- **Fix**: This happens if the SQLite file is being accessed by multiple processes. Stop all running `uvicorn` instances and restart one.

### 4. `npm install` Errors
- **Problem**: Errors while installing frontend libraries.
- **Fix**: Delete the `node_modules` folder and `package-lock.json` in the `frontend` directory, then run `npm install` again.

---

## 🎤 Key Points for Your Viva

### 1. How does the Login work?
- **Explain**: "We use **JWT (JSON Web Tokens)** for authentication. When a user logs in, the backend verifies their credentials against the **SQLite database** using **SQLAlchemy ORM**. If correct, the backend sends a token to the frontend, which is stored in **localStorage** and used for subsequent API calls."

### 2. What is the Tech Stack?
- **Frontend**: "React.js for the UI, Vite for fast building, and Tailwind CSS for modern styling."
- **Backend**: "FastAPI because it's high-performance and uses Python's asynchronous features. SQLAlchemy handles the database interactions."

### 3. Why did we choose SQLite?
- **Explain**: "For the development phase, SQLite is excellent because it's a file-based database. It doesn't require a separate server setup, making the application portable and easy to run on any machine for testing."

### 4. Project Flow (The "Architecture")
- **Flow**: "The user interacts with the **React Frontend**. The frontend makes HTTP requests using **Axios** to the **FastAPI Backend (REST API)**. The backend then communicates with the **SQLite Database** to fetch or update data and returns a JSON response to the frontend."

### 5. How are passwords stored?
- **Explain**: "We never store plain text passwords. We use secure hashing algorithms (like **PBKDF2** or **Bcrypt** via `passlib`) to hash the passwords before saving them to the database. This ensures high-level security."

### 6. What was the "Login Issue" fixed?
- **Explain**: "The demo account was not being created in the database during the initial setup. I corrected the seed script to automatically create both **Admin** and **Demo** accounts on the first run, ensuring the 'Fill Demo User' button works perfectly."

---

## 🌟 Pro-Tip for Viva
If asked about **scalability**, say: *"Currently, we use SQLite for local development, but since we are using SQLAlchemy ORM, we can easily switch to a production-grade database like PostgreSQL or MySQL by just changing the `DATABASE_URL` in the `.env` file."*
