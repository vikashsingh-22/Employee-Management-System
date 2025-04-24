import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    getValues
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const isFormValid = password && confirmPassword && password === confirmPassword;

  const onSubmit = async (data) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="main-container">
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          Employee Management
        </Link>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="nav-link">Sign Up</Link>
        </div>
      </nav>

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
            Reset Password
          </motion.h2>
          <p className="subtitle">
            Create a new password for your account.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="form-container">
            <div className="form-group">
              <label htmlFor="password" className="form-label">New Password</label>
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
                  placeholder="Enter new password"
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
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === getValues('password') || 'Passwords do not match'
                  })}
                  className="form-input"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex flex-col items-center space-y-4 mt-6">
              <motion.button
                whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`submit-btn ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </motion.button>

              <Link to="/login" className="link">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword; 