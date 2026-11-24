const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  familyId?: string;
  relationship?: string;
  accountStatus: string;
}

export function getTokens() {
  if (typeof window === 'undefined') return { access: null, refresh: null };
  return {
    access: localStorage.getItem('ft_access_token'),
    refresh: localStorage.getItem('ft_refresh_token'),
  };
}

export function setTokens(access: string, refresh: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ft_access_token', access);
  localStorage.setItem('ft_refresh_token', refresh);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ft_access_token');
  localStorage.removeItem('ft_refresh_token');
  localStorage.removeItem('ft_user');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('ft_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setUser(user: User) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ft_user', JSON.stringify(user));
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { access, refresh } = getTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (access) {
    headers['Authorization'] = `Bearer ${access}`;
  }

  let res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && refresh) {
    // Attempt token refresh
    try {
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setTokens(data.accessToken, data.refreshToken);
        headers['Authorization'] = `Bearer ${data.accessToken}`;

        // Retry original request
        res = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    } catch {
      clearTokens();
    }
  }

  return res;
}
