// src/types/car.ts
export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
  description: string;
  image: string | null;
  created_at: string;
}

export interface CarFormData {
  brand: string;
  model: string;
  year: number;
  color: string;
  price: number;
  description: string;
  image: File | null;
}