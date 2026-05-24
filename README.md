# EduSphere - Premium Full-Stack Online Course Platform

EduSphere is a state-of-the-art, fully functional full-stack online learning bootcamp platform. It allows students to browse and search dynamic course catalogs, register and verify emails using secure OTP codes, purchase courses securely via Razorpay Test Mode, play lessons using an interactive split study dashboard, and track learning progress. It also provides an in-depth administrative portal for curators to manage courses, syllabus modules, users, and transactions.

---

## 🔗 Live Deployed Links

- **Frontend (Vercel):** [https://edusphere-eta-two.vercel.app/](https://edusphere-eta-two.vercel.app/)
- **Backend (Render):** [https://synent-task8-onlinecourseplatform-prajwal.onrender.com/](https://synent-task8-onlinecourseplatform-prajwal.onrender.com/)
- **Database (MongoDB Atlas):** Live Cloud Cluster (Auto-whitelists all origins)

---

## 🔑 Testing Credentials

Use these pre-seeded, active credentials to log in and test the live application instantly:

### 1. Student Account
- **Email:** `student@platform.com`
- **Password:** `studentpassword123`
- **Privileges:** Can enroll in courses, make mock payments, stream videos, toggle study progress, and view dashboard percentages.

### 2. Administrator/Instructor Account
- **Email:** `admin@platform.com`
- **Password:** `adminpassword123`
- **Privileges:** Full dashboard metrics, create/edit/delete courses, compile dynamic modules and lessons (syllabus builder), promote users to admin, and review completed purchase logs.

---

## 💳 Razorpay Test Mode Payment Credentials

When buying any paid course in the catalog, click **"Enroll Now"** to trigger the real Razorpay payment box. Use these mock credentials to complete successful testing purchases:

- **Payment Method:** Card (Credit/Debit)
- **Test Card Number:** `4111 1111 1111 1111` (Standard Razorpay test card)
- **Expiry Date:** Any future date (e.g. `12/29`)
- **Cardholder Name:** Any name
- **CVV:** Any 3-digit number (e.g. `123`)
- **Verification OTP:** `123456` (or any random numbers)
- *Note:* You can also select **UPI** -> **Netbanking / Success Simulation** in the gateway panel.

---

## 🛠️ Main Features Integrated

1. **JWT-Based Authentication**:
   - Onboarding registry supported by dual modes (Student or Admin role selection).
   - Secure 6-digit OTP verification code required before account activation.
   - Dynamic step-by-step password recovery (Forgot Password) using email OTP codes.
2. **Dynamic Course Catalog**:
   - Glassmorphic hero interface with Google Typography.
   - Debounced search index and interactive filter category cards.
3. **Razorpay Billing Portal**:
   - Creates secure pending orders on the server-side, opens Razorpay popup checkout, validates cryptographic signatures, and unlocks courses.
   - Automatic Developer Bypass fallback if credentials are ever omitted in server files.
4. **Split Study Room**:
   - Minimal deep-focus workspace containing standard HTML5 video player streaming sample Google assets.
   - Live checklists that synchronize completions to MongoDB, refreshing master progress percentage indicators.
5. **Interactive Admin Workspace**:
   - Analytics statistics: total learners, revenue earnings, sales count.
   - Catalog management: Course deletion and nested syllabus modals to build modules/lessons.
   - Learners directory: promotional user switches.
   - Sales logs table: purchase histories.

---

## ⚙️ How to Run Locally

### 1. Clone & Configure Environments
Copy `server/.env.example` to `server/.env` and configure your database parameters:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/online-course-platform
JWT_SECRET=your_jwt_secret_here
RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

### 2. Install & Start Backend
Ensure your local MongoDB database Community Server is active on port 27017:
```bash
cd server
npm install
npm run seed  # Seeds default testing credentials
npm run dev   # Boots nodemon hot-reload server
```

### 3. Install & Start React Client
Vite dev server comes preconfigured with server-side proxy rewrites for relative API endpoints:
```bash
cd client
npm install
npm run dev   # Starts React application on http://localhost:5173/
```
