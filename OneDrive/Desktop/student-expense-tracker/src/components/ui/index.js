// Core UI Components
export { default as Button } from './Button.jsx';
export { default as Input } from './Input.jsx';
export { default as Select } from './Select.jsx';
export { default as Card } from './Card.jsx';
export { default as Alert } from './Alert.jsx';

// Typography
export const Typography = {
  H1: ({ children, className = '', ...props }) => (
    <h1 className={`text-4xl font-bold text-gray-900 ${className}`} {...props}>
      {children}
    </h1>
  ),
  H2: ({ children, className = '', ...props }) => (
    <h2 className={`text-3xl font-bold text-gray-900 ${className}`} {...props}>
      {children}
    </h2>
  ),
  H3: ({ children, className = '', ...props }) => (
    <h3 className={`text-2xl font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  ),
  H4: ({ children, className = '', ...props }) => (
    <h4 className={`text-xl font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h4>
  ),
  H5: ({ children, className = '', ...props }) => (
    <h5 className={`text-lg font-medium text-gray-900 ${className}`} {...props}>
      {children}
    </h5>
  ),
  H6: ({ children, className = '', ...props }) => (
    <h6 className={`text-base font-medium text-gray-900 ${className}`} {...props}>
      {children}
    </h6>
  ),
  Body1: ({ children, className = '', ...props }) => (
    <p className={`text-base text-gray-700 ${className}`} {...props}>
      {children}
    </p>
  ),
  Body2: ({ children, className = '', ...props }) => (
    <p className={`text-sm text-gray-600 ${className}`} {...props}>
      {children}
    </p>
  ),
  Caption: ({ children, className = '', ...props }) => (
    <span className={`text-xs text-gray-500 ${className}`} {...props}>
      {children}
    </span>
  ),
};

// Layout Components
export const Box = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const Container = ({ children, className = '', maxWidth = '7xl', ...props }) => (
  <div 
    className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${
      maxWidth === 'sm' ? 'max-w-3xl' : 
      maxWidth === 'md' ? 'max-w-5xl' : 
      maxWidth === 'lg' ? 'max-w-7xl' : 
      'max-w-full'
    } ${className}`} 
    {...props}
  >
    {children}
  </div>
);

export const Grid = ({ children, className = '', container = false, item = false, ...props }) => {
  if (container) {
    return (
      <div className={`grid ${className}`} {...props}>
        {children}
      </div>
    );
  }
  
  if (item) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }
  
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

// Utility Components
export const Paper = ({ children, className = '', elevation = 1, ...props }) => {
  const shadow = [
    'shadow-sm',
    'shadow',
    'shadow-md',
    'shadow-lg',
    'shadow-xl',
  ][elevation - 1] || 'shadow';
  
  return (
    <div 
      className={`bg-white rounded-lg ${shadow} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

// Default export for backward compatibility
const UIProvider = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    {children}
  </div>
);

export default UIProvider;
