import { create } from 'zustand';

export interface AuthUser {
  name: string;
  role: string;
  employeeId: string;
  department: string;
  field: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (username: string, password?: string) => boolean;
  demoLogin: (role?: 'engineer' | 'manager' | 'operator') => void;
  logout: () => void;
}

const STORAGE_KEY = 'baghewala_dt_auth';

// Read initial auth state from localStorage
const getStoredAuth = (): { isAuthenticated: boolean; user: AuthUser | null } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.isAuthenticated && parsed.user) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return { isAuthenticated: false, user: null };
};

export const useAuthStore = create<AuthState>((set) => {
  const initial = getStoredAuth();

  return {
    isAuthenticated: initial.isAuthenticated,
    user: initial.user,

    login: (username: string, _password?: string) => {
      const user: AuthUser = {
        name: username.trim() || 'Dr. A. K. Verma',
        role: 'Senior Reservoir Engineer',
        employeeId: 'OIL-BGW-4821',
        department: 'Subsurface Asset Optimization',
        field: 'Baghewala Heavy Oil Field',
        email: 'akverma@oilindia.in',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user }));
      set({ isAuthenticated: true, user });
      return true;
    },

    demoLogin: (role = 'engineer') => {
      let user: AuthUser;
      if (role === 'manager') {
        user = {
          name: 'P. K. Goswami',
          role: 'Chief General Manager (Production)',
          employeeId: 'OIL-HQ-1049',
          department: 'Heavy Oil Asset Management',
          field: 'Baghewala Field',
          email: 'pkgoswami@oilindia.in',
        };
      } else if (role === 'operator') {
        user = {
          name: 'R. S. Bhati',
          role: 'SCADA Field Operations Lead',
          employeeId: 'OIL-BGW-8932',
          department: 'Surface Facilities & Artificial Lift',
          field: 'Baghewala Field',
          email: 'rsbhati@oilindia.in',
        };
      } else {
        user = {
          name: 'Er. Rajesh Sharma',
          role: 'Petroleum & Digital Twin Engineer',
          employeeId: 'OIL-BGW-5502',
          department: 'CSS & SRP Optimization Cell',
          field: 'Baghewala Field',
          email: 'rsharma@oilindia.in',
        };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthenticated: true, user }));
      set({ isAuthenticated: true, user });
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({ isAuthenticated: false, user: null });
    },
  };
});
