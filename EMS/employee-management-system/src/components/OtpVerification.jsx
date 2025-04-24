import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResendOtpButton from './ResendOtpButton';

const OtpVerification = ({ email, type, onVerificationSuccess, onVerificationError }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Cleanup OTP on unmount
    useEffect(() => {
        return () => {
            handleCancelOtp();
        };
    }, []);

    const handleCancelOtp = async () => {
        try {
            await axios.post('http://localhost:8080/api/otp/cancel-otp', { email });
        } catch (error) {
            console.error('Error cancelling OTP:', error);
        }
    };

    const handleChange = (index, value) => {
        if (value.length > 1) return; // Prevent multiple digits
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        if (!/^\d{6}$/.test(pastedData)) return; // Only allow 6 digits

        const newOtp = pastedData.split('');
        setOtp(newOtp);
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/api/otp/verify-otp', {
                email,
                otp: otpString
            });
            
            if (onVerificationSuccess) {
                onVerificationSuccess(response.data);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error verifying OTP');
            if (onVerificationError) {
                onVerificationError(error.response?.data?.message || 'Error verifying OTP');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendSuccess = (message) => {
        setError('');
        setOtp(['', '', '', '', '', '']);
    };

    return (
        <div className="otp-verification">
            <h2>Enter Verification Code</h2>
            <p className="text-muted">
                We've sent a verification code to {email}
            </p>
            
            <div className="otp-inputs">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="otp-input"
                        autoComplete="off"
                    />
                ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="otp-actions">
                <button
                    className="btn btn-primary verify-button"
                    onClick={handleVerify}
                    disabled={loading || otp.join('').length !== 6}
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <ResendOtpButton
                    email={email}
                    type={type}
                    onResendSuccess={handleResendSuccess}
                    onResendError={setError}
                />
            </div>

            <style jsx>{`
                .otp-verification {
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 2rem;
                    text-align: center;
                }

                .otp-inputs {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: center;
                    margin: 2rem 0;
                }

                .otp-input {
                    width: 3rem;
                    height: 3rem;
                    font-size: 1.5rem;
                    text-align: center;
                    border: 2px solid #e2e8f0;
                    border-radius: 0.5rem;
                    outline: none;
                    transition: all 0.2s;
                }

                .otp-input:focus {
                    border-color: #3182ce;
                    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
                }

                .error-message {
                    color: #e53e3e;
                    margin: 1rem 0;
                }

                .otp-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    align-items: center;
                }

                .verify-button {
                    width: 100%;
                }

                @media (max-width: 640px) {
                    .otp-input {
                        width: 2.5rem;
                        height: 2.5rem;
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default OtpVerification; 