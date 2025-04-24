import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Auth.css';

const OtpVerification = ({ email, onVerify, onResend }) => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onVerify(otp);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>Enter Verification Code</h2>
            <p className="auth-subtitle">
                We've sent a verification code to {email}
            </p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        maxLength="6"
                        required
                    />
                </div>
                <button type="submit" className="submit-button" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
            </form>
            <p className="auth-footer">
                Didn't receive the code?{' '}
                <button 
                    onClick={onResend} 
                    className="link-button"
                    type="button"
                >
                    Resend
                </button>
            </p>
        </div>
    );
};

const ForgotPassword = () => {
    const [step, setStep] = useState('email'); // 'email', 'otp', or 'reset'
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('employee');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post('http://localhost:3001/api/otp/send-otp', {
                email,
                type: 'forgot',
                role
            });
            toast.success('Verification code sent to your email');
            setStep('otp');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerificationSuccess = async (otp) => {
        try {
            await axios.post('http://localhost:3001/api/otp/verify-otp', {
                email,
                otp,
                type: 'forgot'
            });
            toast.success('Email verified successfully');
            setStep('reset');
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Verification failed');
        }
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            await axios.post('http://localhost:3001/api/otp/send-otp', {
                email,
                type: 'forgot',
                role
            });
            toast.success('New verification code sent');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('http://localhost:3001/api/auth/reset-password', {
                email,
                newPassword: password,
                role
            });
            toast.success('Password reset successful');
            // Navigate to login after successful reset
            window.location.href = '/login';
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <nav className="auth-nav">
                <div className="nav-brand">Employee Management</div>
                <div className="nav-links">
                    <Link to="/login" className="nav-link nav-button">Login</Link>
                    <Link to="/signup" className="nav-link nav-button">Sign Up</Link>
                </div>
            </nav>

            <div className="auth-container">
                <div className="auth-card">
                    {step === 'email' && (
                        <>
                            <h1>Forgot Password</h1>
                            <p className="auth-subtitle">
                                Enter your email address to reset your password
                            </p>
                            <form onSubmit={handleEmailSubmit}>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Select Role</label>
                                    <div className="role-selector">
                                        <button
                                            type="button"
                                            className={`role-button ${role === 'employee' ? 'active' : ''}`}
                                            onClick={() => setRole('employee')}
                                        >
                                            Employee
                                        </button>
                                        <button
                                            type="button"
                                            className={`role-button ${role === 'manager' ? 'active' : ''}`}
                                            onClick={() => setRole('manager')}
                                        >
                                            Manager
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="submit-button" disabled={isLoading}>
                                    {isLoading ? 'Sending Code...' : 'Send Reset Code'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'otp' && (
                        <OtpVerification
                            email={email}
                            onVerify={handleVerificationSuccess}
                            onResend={handleResendOtp}
                        />
                    )}

                    {step === 'reset' && (
                        <>
                            <h1>Reset Password</h1>
                            <p className="auth-subtitle">
                                Enter your new password
                            </p>
                            <form onSubmit={handlePasswordReset}>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <div className="password-input">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <svg viewBox="0 0 24 24" className="eye-icon">
                                                <path d={showPassword 
                                                    ? "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                                                    : "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"}
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <div className="password-input">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="submit-button" disabled={isLoading}>
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}

                    <p className="auth-footer">
                        Remember your password? <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
};

export default ForgotPassword; 