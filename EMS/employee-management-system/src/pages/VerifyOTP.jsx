import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      otp: ''
    }
  });

  const otp = watch('otp');
  const isFormValid = otp && otp.length === 6;

  const onSubmit = async (data) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('OTP verified successfully!');
      navigate('/reset-password');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
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
            Verify OTP
          </motion.h2>
          <p className="subtitle">
            Enter the 6-digit code sent to your email address.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="form-container">
            <div className="form-group">
              <label htmlFor="otp" className="form-label">Enter OTP</label>
              <input
                type="text"
                id="otp"
                maxLength={6}
                {...register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: 'Please enter a valid 6-digit OTP'
                  }
                })}
                className="form-input text-center tracking-[0.5em] text-xl"
                placeholder="000000"
              />
              {errors.otp && (
                <p className="error-message">{errors.otp.message}</p>
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
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </motion.button>

              <div className="flex flex-col items-center gap-2">
                <button 
                  type="button" 
                  className="link"
                  onClick={() => navigate('/forgot-password')}
                >
                  Resend OTP
                </button>
                <Link to="/login" className="link">
                  Back to Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP; 