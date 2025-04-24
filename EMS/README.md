# Employee Management System

## Project Overview

The Employee Management System is a comprehensive web application designed to streamline HR operations and employee management. It provides a centralized platform for managing employee data, attendance, leave requests, tasks, and more. The system features role-based access control, with different interfaces and capabilities for managers and employees.

### Key Features

- **User Authentication & Authorization**: Secure login system with role-based access (Manager/Employee)
- **Employee Profile Management**: Complete employee profiles with personal and professional details
- **Task Management**: Assign, track, and update tasks for employees
- **Leave Management**: Request, approve, and track employee leaves
- **Attendance Tracking**: Record and monitor employee attendance
- **Dashboard & Analytics**: Visual representation of key metrics for managers
- **Profile Photo Upload**: Cloud-based profile photo management with Cloudinary
- **Unique Employee IDs**: Automatic generation of role-based unique identifiers

## Technology Stack

### Frontend
- **React.js**: UI library for building the user interface
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Axios**: Promise-based HTTP client for API requests
- **React Router**: Navigation and routing
- **React Icons**: Icon library
- **React Hook Form**: Form validation and handling

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling tool
- **JSON Web Token (JWT)**: Authentication mechanism
- **Bcrypt.js**: Password hashing

### Third-Party Services
- **Cloudinary**: Cloud storage for profile images
- **Nodemailer**: Email service for notifications and OTP verification

## Folder Structure

```
├── backend/                  # Backend server code
│   ├── config/              # Configuration files (DB, email, Cloudinary)
│   ├── Controllers/         # Route controllers
│   ├── middleware/          # Express middleware (auth, validation)
│   ├── Models/              # Mongoose models
│   ├── Routes/              # API routes
│   └── utils/               # Utility functions
│
├── employee-management-system/  # Frontend React application
│   ├── public/              # Static files
│   └── src/                 # Source files
│       ├── components/      # Reusable UI components
│       ├── context/         # React context providers
│       ├── pages/           # Page components
│       └── services/        # API service functions
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register a new user | Public |
| POST | `/api/auth/login` | Authenticate a user | Public |
| GET | `/api/auth/profile` | Get user profile | Private |
| GET | `/api/auth/me` | Get current user data | Private |
| PUT | `/api/auth/me` | Update current user profile | Private |
| POST | `/api/auth/reset-password` | Reset user password | Public |
| POST | `/api/auth/upload-profile-photo` | Upload profile photo | Private |

### Employee Management (Manager Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/add-employee` | Add a new employee | Manager |
| GET | `/api/auth/employees` | Get all employees under manager | Manager |
| PUT | `/api/auth/employees/:id` | Update employee details | Manager |
| DELETE | `/api/auth/employees/:id` | Delete an employee | Manager |
| GET | `/api/auth/stats` | Get dashboard statistics | Manager |

### Task Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tasks` | Get tasks (filtered by role) | Private |
| POST | `/api/tasks` | Create a new task | Manager |
| PUT | `/api/tasks/:id` | Update a task | Private |
| DELETE | `/api/tasks/:id` | Delete a task | Manager |

### Leave Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/leaves` | Get leave requests (filtered by role) | Private |
| POST | `/api/leaves` | Create a leave request | Employee |
| PUT | `/api/leaves/:id` | Update leave request status | Manager |

### Attendance Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/attendance/mark` | Mark attendance | Employee |
| GET | `/api/attendance/records` | Get attendance records | Private |
| POST | `/api/attendance/holiday` | Mark a holiday | Manager |
| GET | `/api/attendance/holidays` | Get holidays | Private |
| GET | `/api/attendance/summary/:id` | Get attendance summary | Private |

## Middleware Logic

### Authentication Middleware

The system uses JWT-based authentication middleware to protect routes:

- **auth**: Verifies the JWT token and attaches the user to the request object
- **isManager**: Ensures the user has a manager role for protected routes

### Validation Middleware

- **validateSignup**: Validates user registration data
- **validateLogin**: Validates login credentials

## Key Implementation Logic

### Employee ID Generation

The system automatically generates unique employee IDs with the following logic:

1. **Role-Based Prefix**: 
   - Managers: `MAN-` prefix
   - Employees: `EMP-` prefix

2. **Random Number Generation**:
   - 5-digit random number (10000-99999)
   - Example: `EMP-45678` or `MAN-12345`

3. **Collision Handling**:
   - Implements retry logic (up to 5 attempts)
   - Detects MongoDB duplicate key errors
   - Generates new IDs on collision

### Profile Photo Management

Profile photos are managed using Cloudinary with the following features:

1. **Client-Side Validation**:
   - File type validation (JPEG, PNG)
   - Size limitation (max 2MB)

2. **Direct Upload to Cloudinary**:
   - Uses unsigned upload preset
   - Stores both image URL and public ID

3. **Previous Image Deletion**:
   - Automatically deletes previous profile image when a new one is uploaded
   - Prevents orphaned images in Cloudinary

### Manager-Employee Relationship

The system maintains a hierarchical relationship between managers and employees:

1. **Employee Assignment**:
   - Each employee is linked to their manager via `adminRef` field
   - Set during employee creation

2. **Filtered Views**:
   - Managers only see employees assigned to them
   - Dashboard statistics are filtered by manager's team
   - Tasks and leave requests are filtered accordingly

## Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
PORT=3001
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/employee-management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (for Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
```

## Authentication & Authorization

The system implements a comprehensive role-based access control system:

### User Roles

1. **Manager**:
   - Can add, view, update, and delete employees
   - Can create and assign tasks
   - Can approve or reject leave requests
   - Can mark holidays
   - Can view dashboard statistics

2. **Employee**:
   - Can view and update their own profile
   - Can view and update assigned tasks
   - Can request leaves
   - Can mark their attendance
   - Can view their attendance summary

### Authentication Flow

1. **Registration/Login**:
   - User provides credentials
   - System validates credentials
   - JWT token is generated and returned

2. **Protected Routes**:
   - JWT token is sent in Authorization header
   - Middleware verifies token
   - User role is checked for authorization

## How to Run the Project Locally

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the required environment variables (see Environment Configuration section)

4. Start the server:
   ```
   npm start
   ```
   For development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd employee-management-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Cloudinary Setup

1. Create a Cloudinary account at https://cloudinary.com
2. Navigate to Settings > Upload in your Cloudinary dashboard
3. Create an upload preset with the following settings:
   - Preset name: `imageEMS`
   - Signing Mode: **Unsigned**
   - Folder: `employee_profiles` (optional)
4. Add your Cloudinary credentials to the `.env` file

## Known Issues or Limitations

- The system currently doesn't support multiple managers for a single employee
- Password reset functionality requires email configuration
- Mobile responsiveness may need improvements in some areas
- No pagination implemented for large data sets

## Future Enhancements

- Implement advanced analytics and reporting
- Add document management for employee documents
- Implement real-time notifications
- Add payroll management features
- Enhance mobile responsiveness

## Credits & Acknowledgements

- [React](https://reactjs.org/) - UI Library
- [Express](https://expressjs.com/) - Web Framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Cloudinary](https://cloudinary.com/) - Image Management
- [JWT](https://jwt.io/) - Authentication

## License

This project is licensed under the MIT License - see the LICENSE file for details.
