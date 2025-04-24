import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResendOtpButton = ({ email, type, onResendSuccess, onResendError }) => {
    const [timer, setTimer] = useState(60);
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        let interval;
        if (disabled && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setDisabled(false);
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [disabled, timer]);

    const handleResend = async () => {
        try {
            setDisabled(true);
            const response = await axios.post('http://localhost:8080/api/otp/send-otp', {
                email,
                type
            });
            if (onResendSuccess) {
                onResendSuccess(response.data.message);
            }
        } catch (error) {
            setDisabled(false);
            setTimer(0);
            if (onResendError) {
                onResendError(error.response?.data?.message || 'Error resending OTP');
            }
        }
    };

    return (
        <button
            className={`btn ${disabled ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleResend}
            disabled={disabled}
        >
            {disabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
        </button>
    );
};

export default ResendOtpButton; 