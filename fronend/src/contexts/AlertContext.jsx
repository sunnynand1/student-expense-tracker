// src/contexts/AlertContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

const AlertContext = createContext(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = 'info') => {
    const id = Date.now();
    const newAlert = { id, message, type };
    
    // Use react-toastify for notifications
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      default:
        toast.info(message);
    }
    
    setAlerts(prev => [...prev, newAlert]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 5000);
    
    return id;
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const value = {
    alerts,
    showAlert,
    removeAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

// Alert component
export const Alert = ({ id, message, severity = 'info', onClose }) => {
  const alertClasses = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  };

  return (
    <div 
      className={`${alertClasses[severity]} border px-4 py-3 rounded relative mb-2`} 
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
      {onClose && (
        <span 
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          onClick={() => onClose(id)}
        >
          <svg className={`fill-current h-6 w-6 ${alertClasses[severity].replace('bg-', 'text-').replace(/\s+.*$/, '')}`} role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
          </svg>
        </span>
      )}
    </div>
  );
};

// Alert container component
export const AlertContainer = () => {
  const { alerts, removeAlert } = useAlert();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          id={alert.id}
          message={alert.message}
          severity={alert.type}
          onClose={removeAlert}
        />
      ))}
    </div>
  );
};