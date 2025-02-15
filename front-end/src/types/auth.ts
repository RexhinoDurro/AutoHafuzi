// src/types/auth.ts
export interface LoginFormData {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}


