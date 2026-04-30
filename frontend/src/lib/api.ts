export const API_BASE_URL = ""; // Set to empty string to use relative paths, which will be rewritten by next.config.js

/**
 * A custom fetch wrapper that automatically prepends the API base URL.
 * @param endpoint - The API endpoint (e.g., "/api/bots")
 * @param options - Standard fetch options (method, headers, body, etc.)
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Merge the user's options with credentials to ensure cookies are sent!
  const finalOptions: RequestInit = {
    credentials: "include",
    ...options,
  };
  
  return fetch(url, finalOptions);
}