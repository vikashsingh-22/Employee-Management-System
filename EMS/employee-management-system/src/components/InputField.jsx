import { forwardRef } from 'react';

const InputField = forwardRef(
  ({ label, type = 'text', error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="label">
            <span className="label-text text-white">{label}</span>
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`form-input ${className}`}
          {...props}
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField; 