import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  error,
  helperText,
  startIcon,
  endIcon,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
            startIcon ? 'pl-10' : 'pl-3'
          } ${endIcon ? 'pr-10' : 'pr-3'} ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {endIcon}
          </div>
        )}
      </div>
      {helperText && (
        <p className={`mt-1 text-sm ${
          error ? 'text-red-600' : 'text-gray-500'
        }`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
