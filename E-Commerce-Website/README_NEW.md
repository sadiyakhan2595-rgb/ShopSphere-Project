# 🛒 ShopSphere - Modern E-Commerce Platform

ShopSphere is a full-stack, premium e-commerce application designed for a seamless shopping experience. It features a robust Python/FastAPI backend and a highly responsive React/Vite frontend with sleek styling via Tailwind CSS.

---

## 🌟 Key Features
- **User Authentication**: Secure Login/Signup using JWT (JSON Web Tokens).
- **Product Management**: Responsive product catalog with detailed views.
- **Cart System**: Real-time cart updates and management.
- **Admin Dashboard**: Specialized interface for managing products and orders.
- **Modern UI**: Built with a "premium first" aesthetic using Lucide-react and custom glassmorphism components.
- **Fast Performance**: Optimized frontend builds with Vite and asynchronous API responses from FastAPI.

---

## 💻 Tech Stack
- **Frontend**: 
  - React.js 18+ (Hooks, Context API)
  - Vite (Build Tool)
  - Tailwind CSS (Styling)
  - Axios (API Communication)
  - Lucide-react (Icons)
- **Backend**:
  - FastAPI (Python Framework)
  - SQLAlchemy (ORM)
  - SQLite (Database - for zero-config local setup)
  - Pydantic (Data Validation)
  - Passlib (Password Hashing)
- **Database**:
  - SQLite (Local development default)

---

## 🚀 Getting Started (Localhost)

Follow these steps to run the project on your machine:

### 1. Prerequisites
- Python 3.8+ installed.
- Node.js & npm installed.

### 2. Backend Setup
1. Open your terminal in the `backend` directory.
2. Re-create and activate the virtual environment:
   ```powershell
   rd /s /q venv              # Force delete old venv
   python -m venv venv        # Create new venv
   .\venv\Scripts\activate    # Activate (Windows)
   pip install -r requirements.txt
   ```
3. Run the backend:
   ```bash
   uvicorn main:app --reload
   ```
   *Note: The database (`shopsphere.db`) and admin user will be created automatically on first run.*

### 3. Frontend Setup
1. Open a **NEW** terminal in the `frontend` directory.
2. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Login Credentials
To test the admin features, use:
- **Email**: `admin@shopsphere.com`
- **Password**: `Admin@123`

---

## 📂 Project Structure
- **/frontend**: React components, pages, and context providers.
- **/backend**: FastAPI routes, SQLAlchemy models, and database logic.
- **/backend/models**: Database schema definitions.
- **/backend/routes**: API endpoint logic.
- **shopsphere.db**: Local SQLite database file (generated after first run).
