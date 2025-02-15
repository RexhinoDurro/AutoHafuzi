// src/utils/auth.ts
export const getStoredAuth = (): { token: string | null } => {
  const token = localStorage.getItem('adminToken');
  return { token };
};

export const setStoredAuth = (token: string) => {
  localStorage.setItem('adminToken', token);
};

export const clearStoredAuth = () => {
  localStorage.removeItem('adminToken');
};