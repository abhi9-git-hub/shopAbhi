const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://shopabhi-backend-gf9t.onrender.com'
    : '');

export const apiFetch = (path, options) =>
  fetch(`${API_BASE_URL}${path}`, options);
