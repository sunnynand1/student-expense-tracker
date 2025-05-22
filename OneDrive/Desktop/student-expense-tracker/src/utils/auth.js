// Helper function to get cookie by name
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper function to get the auth token from cookies or localStorage (for backward compatibility)
export const getToken = () => {
  // First try to get from cookie
  const tokenFromCookie = getCookie('token');
  if (tokenFromCookie) {
    return tokenFromCookie;
  }
  
  // Fallback to localStorage (for backward compatibility)
  return localStorage.getItem('token');
};

// Helper function to set the auth token
// Note: In a real app, the token should be set by the server via HTTP-only cookie
export const setToken = (token) => {
  if (token) {
    // This is a fallback - in production, the server should set the HTTP-only cookie
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`;
    localStorage.setItem('token', token); // Keep for backward compatibility
  }
};

// Helper function to remove the auth token
export const removeToken = () => {
  // Remove from cookies
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  // Remove from localStorage
  localStorage.removeItem('token');
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};
