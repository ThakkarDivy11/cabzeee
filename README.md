# CabZee - Uber Clone (MERN Stack)

A comprehensive ride-sharing platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring real-time ride booking, driver management, and secure payment processing.

![CabZee](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

### 🔐 Authentication & Authorization
- Multi-role registration (Rider, Driver, Admin)
- Email verification with OTP
- JWT-based authentication with refresh tokens
- Password reset via email
- Role-based access control
- Profile picture upload

### 👥 User Dashboards
- **Rider Dashboard**: Book rides, view history, manage wallet
- **Driver Dashboard**: Accept rides, track earnings, manage availability
- **Admin Dashboard**: User management, verification system

### 🚗 Ride Management
- Real-time ride booking
- Fare estimation
- Driver availability tracking
- Ride history and ratings
- Multiple payment methods (Cash, Card, Wallet, UPI)

### 💳 Payment System
- CabZee Wallet integration
- Saved payment methods
- Transaction history
- Secure card storage

### 📄 Document Management (Drivers)
- License upload and verification
- Insurance document upload
- Vehicle registration (RC) upload
- Admin verification system

### 🗺️ Location Services
- Interactive map with Leaflet
- Pickup and drop location selection
- Distance calculation
- Route visualization

### 📧 Email Services
- OTP verification emails
- Password reset emails
- Nodemailer integration

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: 
  - bcryptjs (password hashing)
  - Helmet (security headers)
  - express-rate-limit (rate limiting)
  - CORS
- **Validation**: express-validator
- **File Upload**: Multer
- **Email**: Nodemailer

### Frontend
- **Library**: React 18
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React Leaflet
- **Forms**: React Hook Form + Yup validation
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Testing**: React Testing Library

## 📁 Project Structure

```
cabzee-uber-clone/
├── frontend/            # React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/             # Node.js/Express application
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── public/
│   ├── server.js            # Express server setup
│   └── package.json
├── .gitignore
├── README.md
└── ...
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cabzee-uber-clone.git
   cd cabzee-uber-clone
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ..
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/uber-clone
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this-in-production
   JWT_EXPIRE=7d
   REFRESH_TOKEN_EXPIRE=30d
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   FRONTEND_URL=http://localhost:3000
   ```

   **Gmail App Password Setup:**
   - Enable 2-factor authentication on your Gmail account
   - Go to Google Account → Security → App passwords
   - Generate a new app password for "Mail"
   - Use this password in the `EMAIL_PASS` field

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Server runs on http://localhost:5000

7. **Start the frontend** (in a new terminal)
   ```bash
   npm start
   ```
   Frontend runs on http://localhost:3000

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/admin-login` | Admin login | Public |
| POST | `/api/auth/verify-otp` | Verify email OTP | Public |
| POST | `/api/auth/resend-otp` | Resend OTP | Public |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password/:token` | Reset password | Public |
| POST | `/api/auth/refresh-token` | Refresh access token | Public |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users/me` | Get current user profile | Private |
| PUT | `/api/users/me` | Update user profile | Private |
| GET | `/api/users/drivers` | Get online drivers | Private |
| GET | `/api/users` | Get all users | Admin |
| POST | `/api/users/card` | Add saved card | Private |
| DELETE | `/api/users/card/:id` | Remove saved card | Private |
| POST | `/api/users/documents/upload` | Upload driver document | Private (Driver) |
| PUT | `/api/users/documents/:userId/verify` | Verify document | Admin |

### Ride Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/rides` | Create new ride request | Private |
| GET | `/api/rides/history` | Get ride history | Private |
| GET | `/api/rides/:id` | Get ride details | Private |
| PUT | `/api/rides/:id/status` | Update ride status | Private |

## 🎯 Default Admin Account

An admin account is automatically created on first server start:

- **Email**: `divythakkar318@gmail.com`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change these credentials in production!

## 📱 Application Features

### For Riders
1. Register/Login as a Rider
2. Set pickup and drop locations on map
3. Get fare estimates
4. View available drivers
5. Book rides
6. Choose payment method
7. View ride history
8. Rate and review drivers
9. Manage wallet and payment methods

### For Drivers
1. Register/Login as a Driver
2. Upload required documents (License, Insurance, RC)
3. Toggle availability status
4. Receive ride requests
5. Accept/reject rides
6. Navigate to pickup location
7. Start and complete trips
8. View earnings and ride history
9. Receive ratings from riders

### For Admins
1. View all users (Riders and Drivers)
2. Verify driver documents
3. Monitor system activity
4. Manage user accounts
5. View system statistics

## 🔒 Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT access tokens (7-day expiry)
- Refresh tokens (30-day expiry)
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- File upload restrictions (size, type)

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `REFRESH_TOKEN_SECRET` | Refresh token secret | Yes |
| `JWT_EXPIRE` | JWT expiry duration | Yes |
| `REFRESH_TOKEN_EXPIRE` | Refresh token expiry | Yes |
| `EMAIL_USER` | Gmail address for emails | Yes |
| `EMAIL_PASS` | Gmail app password | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `build` folder
3. Set environment variable: `REACT_APP_API_URL=your-backend-url`

### Backend (Heroku/Railway/Render)
1. Ensure all environment variables are set
2. Use `npm start` as start command
3. Set `NODE_ENV=production`
4. Configure MongoDB Atlas connection string

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by Uber's ride-sharing platform
- Built with modern MERN stack technologies
- Security best practices implemented
- Designed for scalability and maintainability

## 📞 Support

For issues and questions:
- Open an issue in the GitHub repository
- Contact: divythakkar318@gmail.com

---

**Built with ❤️ using the MERN Stack**