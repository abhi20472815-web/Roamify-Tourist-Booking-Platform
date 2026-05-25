# Roamify - Full-Stack Tourist Booking Platform

Roamify is a college major-project-grade, production-like Full-Stack Tourist Booking Web Application. It consists of a high-performance **React.js + Vite** frontend styled with **Tailwind CSS**, communicating via **Axios** with a modular **Python Flask** REST API backed by a **MongoDB** database. Sessions are fully secured with **JWT Authentication** and hashed passwords. All rates, totals, and inputs use the **Indian Rupee (₹)** currency format, and the database automatically seeds 8 scenic domestic and international travel packages (including Goa, Kerala, Ladakh, Bali, and Paris) out-of-the-box.

---

## Key Project Features

1. **JWT Authentication & Security**: Complete Register and Login systems. Passwords are encrypted in MongoDB using `bcrypt` (or highly secure `werkzeug.security` fallbacks). Secure JSON Web Tokens (JWT) are saved in client-side LocalStorage and automatically attached to Axios headers via request interceptors.
2. **Interactive Search & Tour Filters Panel**: Multi-faceted real-time filters allowing users to search packages by query keywords, geographical locations, or maximum budgets on the Home and Browse pages.
3. **Immersive Tour Details & Gallery**: Scenic responsive image grids, detailed feature listings (WiFi, guide, hotels), an interactive Day-by-day itinerary accordion planner, and a live pricing calculator.
4. **Dynamic Booking System**: Instantly logs travel dates, passenger counts, and automatically aggregates total prices. Seamlessly inserts bookings into MongoDB and triggers a `canvas-confetti` explosion on success!
5. **Personalized Trip Dashboard**: "My Bookings" records active and past reservations, including status updates (Pending, Confirmed, Cancelled) and dynamic cancellation features.
6. **Master Admin Dashboard Panel**: Single-pane controller restricted to administrative personnel, providing:
   - **Overview Analytics**: Revenue tracker, booking rates, and user registration feeds.
   - **Tour CRUD Manager**: Modals to add, edit, or delete tour packages, complete with dynamic daily itinerary row builders.
   - **Bookings Ledger**: Administrative dropdown selectors to instantly confirm or cancel customer trips.
   - **User Audits**: Review profiles and account roles.

---

## Full Project Directory Structure

```text
d:\python\
│
├── backend\
│   ├── config.py              # Loads environment parameters (.env)
│   ├── db.py                  # Initialises connection with PyMongo client
│   ├── app.py                 # Flask server entrypoint & seeders
│   ├── requirements.txt       # Pip package dependencies
│   ├── .env                   # Local configuration parameters (Port, MongoDB URI)
│   ├── .env.example           # Configuration template
│   │
│   ├── controllers\           # Processes core API logic
│   │   ├── auth_controller.py
│   │   ├── package_controller.py
│   │   ├── booking_controller.py
│   │   └── admin_controller.py
│   │
│   ├── models\                # Data model schemas & security helpers
│   │   └── user.py
│   │
│   ├── middleware\            # Route guards
│   │   └── auth.py            # Token-based JWT checking
│   │
│   └── routes\                # Defines Flask Blueprints and endpoints
│       ├── auth_routes.py
│       ├── package_routes.py
│       ├── booking_routes.py
│       └── admin_routes.py
│
└── frontend\
    ├── package.json           # npm configuration and dependencies
    ├── tailwind.config.js     # Custom luxury color themes & Outfitted fonts
    ├── postcss.config.js      # PostCSS settings compiling Tailwind
    ├── vite.config.js         # Vite bundler parameters
    ├── index.html             # Document head and metadata (SEO optimized)
    │
    └── src\
        ├── main.jsx           # Mounts React into DOM root
        ├── App.jsx            # Sets up central navigation routing and toasts
        ├── index.css          # Houses Tailwind bindings & glassmorphic styles
        │
        ├── assets\            # Local static files
        │
        ├── components\        # Reusable visual units
        │   ├── Navbar.jsx     # Glassmorphic responsive header
        │   ├── Footer.jsx     # Modern multi-column directory footer
        │   ├── PackageCard.jsx# Scenic package card display
        │   └── ProtectedRoute.jsx # Dynamic auth/admin route guard
        │
        ├── context\           # Global session providers
        │   └── AuthContext.jsx# Handles user logging, storage, & token freshness
        │
        ├── services\          # Global API bindings
        │   └── api.js         # Intercepted Axios client
        │
        └── pages\             # Comprehensive screen layouts
            ├── Home.jsx       # Hero search bar, values, testimonials
            ├── Packages.jsx   # Filter-supported catalog grid
            ├── PackageDetails.jsx # Detailed gallery, itinerary & booker
            ├── Login.jsx      # Session credential access
            ├── Register.jsx   # Account creation
            ├── MyBookings.jsx # Personal reservation tracker
            └── AdminDashboard.jsx # Analytics, Inventory, & Booking controls
```

---

## Seed Admin Credentials
Upon server initialization, the Flask API automatically seeds a default system administrator if it does not already exist:
* **Admin Email**: `admin@tourist.com`
* **Admin Password**: `Admin@12345`

You can use these credentials to access the fully featured **Admin Dashboard**!

---

## Installation & Running Instructions

Follow these steps to launch both the backend server and frontend client locally:

### Step 1: Database Setup
Make sure MongoDB is installed and running on your local machine:
* Default connection URI: `mongodb://localhost:27017`
* If using **MongoDB Atlas**, simply edit `backend/.env` and replace `MONGO_URI` with your Atlas connection string.

### Step 2: Backend API Launch
1. Open a terminal and change directory to the `backend` folder:
   ```bash
   cd d:\python\backend
   ```
2. Create and activate a Virtual Environment (Recommended):
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python app.py
   ```
   The API will start running at `http://localhost:5000` and automatically seed sample tour packages!

### Step 3: Frontend Client Launch
1. Open a new terminal and change directory to the `frontend` folder:
   ```bash
   cd d:\python\frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
   The client application will boot up at `http://localhost:3000`. Open this URL in your web browser to experience Roamify!

---

## REST API Endpoint Ledger

| Segment | Method | Endpoint | Description | Authentication |
| :--- | :---: | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/register` | Register a new user | Public |
| **Auth** | `POST` | `/api/auth/login` | Log in and receive JWT | Public |
| **Auth** | `GET` | `/api/auth/me` | Fetch currently logged profile | User JWT |
| **Packages**| `GET` | `/api/packages` | Fetch/Filter all packages | Public |
| **Packages**| `GET` | `/api/packages/<id>` | Fetch single package detail | Public |
| **Packages**| `POST` | `/api/packages` | Create a new tour package | Admin JWT |
| **Packages**| `PUT` | `/api/packages/<id>`| Edit existing tour package | Admin JWT |
| **Packages**| `DELETE`| `/api/packages/<id>`| Delete package & associated bookings | Admin JWT |
| **Bookings**| `POST` | `/api/bookings` | Place a new tour booking | User JWT |
| **Bookings**| `GET` | `/api/bookings/user`| Fetch personal booking history | User JWT |
| **Bookings**| `GET` | `/api/bookings` | List all bookings across system | Admin JWT |
| **Bookings**| `PUT` | `/api/bookings/<id>/status`| Update status (pending/confirmed/cancelled)| Admin (or Owner Cancel) |
| **Admin** | `GET` | `/api/admin/stats` | Aggregate analytic platform metrics | Admin JWT |
| **Admin** | `GET` | `/api/admin/users` | List all registered user profiles | Admin JWT |
