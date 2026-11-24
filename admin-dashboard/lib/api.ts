const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  familyId?: string;
  accountStatus: string;
}

export function getTokens() {
  if (typeof window === 'undefined') return { access: null, refresh: null };
  return {
    access: localStorage.getItem('ft_admin_access'),
    refresh: localStorage.getItem('ft_admin_refresh'),
  };
}

export function setTokens(access: string, refresh: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ft_admin_access', access);
  localStorage.setItem('ft_admin_refresh', refresh);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ft_admin_access');
  localStorage.removeItem('ft_admin_refresh');
  localStorage.removeItem('ft_admin_user');
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('ft_admin_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminUser(user: AdminUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ft_admin_user', JSON.stringify(user));
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
