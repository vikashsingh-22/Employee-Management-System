import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const Signup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('form'); // 'form' or 'otp'
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'employee',
        adminEmail: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // First, send OTP
            await axios.post('http://localhost:3001/api/otp/send-otp', {
                email: formData.email,
                type: 'signup'
            });
            
            toast.success('Verification code sent to your email');
            setStep('otp');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpVerify = async (otp) => {
        try {
            // First verify OTP
            await axios.post('http://localhost:3001/api/otp/verify-otp', {
                email: formData.email,
                otp,
                type: 'signup'
            });

            // Then complete signup
            const response = await axios.post('http://localhost:3001/api/auth/signup', {
                name: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                adminEmail: formData.role === 'employee' ? formData.adminEmail : undefined
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                toast.success('Account created successfully!');
                navigate(formData.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard');
            }
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Verification failed');
        }
    };

    const handleResendOtp = async () => {
        try {
            await axios.post('http://localhost:3001/api/otp/send-otp', {
                email: formData.email,
                type: 'signup'
            });
            toast.success('New verification code sent');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend code');
        }
    };

    return (
        <div className="auth-page">
            <nav className="auth-nav">
                <div className="nav-brand">Employee Management</div>
                <div className="nav-links">
                    <Link to="/login" className="nav-link nav-button">Login</Link>
                    <Link to="/signup" className="nav-link nav-button active">Sign Up</Link>
                </div>
            </nav>

            <div className="auth-container">
                <div className="auth-card">
                    {step === 'form' ? (
                        <>
                            <h1>Create Account</h1>
                            <form onSubmit={handleInitialSubmit}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Enter your full name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Password</label>
                                    <div className="password-input">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange}
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
                                    <label>Role</label>
                                    <div className="role-selector">
                                        <button
                                            type="button"
                                            className={`role-button ${formData.role === 'employee' ? 'active' : ''}`}
                                            onClick={() => handleChange({ target: { name: 'role', value: 'employee' } })}
                                        >
                                            Employee
                                        </button>
                                        <button
                                            type="button"
                                            className={`role-button ${formData.role === 'manager' ? 'active' : ''}`}
                                            onClick={() => handleChange({ target: { name: 'role', value: 'manager' } })}
                                        >
                                            Manager
                                        </button>
                                    </div>
                                </div>

                                {formData.role === 'employee' && (
                                    <div className="form-group">
                                        <label>Admin Email</label>
                                        <input
                                            type="email"
                                            name="adminEmail"
                                            placeholder="Enter admin's email"
                                            value={formData.adminEmail}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                )}

                                <button type="submit" className="submit-button" disabled={isLoading}>
                                    {isLoading ? 'Sending Code...' : 'Sign Up'}
                                </button>
                            </form>

                            <p className="auth-footer">
                                Already have an account? <Link to="/login">Login</Link>
                            </p>
                        </>
                    ) : (
                        <OtpVerification
                            email={formData.email}
                            onVerify={handleOtpVerify}
                            onResend={handleResendOtp}
                        />
                    )}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
};

export default Signup; 