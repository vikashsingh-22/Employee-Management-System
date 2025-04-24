import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import RoleSelector from '../components/RoleSelector';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('employee');
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  
  // Auto logout when visiting login page
  useEffect(() => {
    logout();
  }, [logout]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const email = watch('email');
  const password = watch('password');

  const isFormValid = email && password && role;

  const onSubmit = async (data) => {
    try {
      const response = await authService.login(data.email, data.password, role);
      login(response.user, response.token);
      toast.success('Login successful!');
      
      // Redirect based on user role
      switch (response.user.role) {
        case 'manager':
        case 'admin':
          navigate('/manager-dashboard');
          break;
        case 'employee':
          navigate('/employee-dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="main-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center"
      >
        <div className="glass-card">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="title"
          >
            Login
          </motion.h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="form-container">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="form-input"
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="form-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <RoleSelector role={role} setRole={setRole} />
            </div>

            <div className="flex flex-col items-center space-y-4 mt-6">
              <motion.button
                whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`submit-btn ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </motion.button>

              <Link to="/forgot-password" className="link">
                Forgot Password?
              </Link>

              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="link">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;