const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const jsonHeaders = { 'Content-Type': 'application/json' };

export function assetUrl(path) {
  if (!path || /^https?:\/\//.test(path)) return path;
  return `${API_URL}${path}`;
}

export async function api(path, options = {}) {
  const config = {
    credentials: 'include',
    ...options
  };

  if (config.body && !(config.body instanceof FormData)) {
    config.headers = { ...jsonHeaders, ...(config.headers || {}) };
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_URL}${path}`, config);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}
