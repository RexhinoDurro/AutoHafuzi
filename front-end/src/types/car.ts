export interface Car {
  id: number;
  make_id: number;
  model_id: number;
  variant_id?: number;    // Added variant ID
  brand: string;
  model_name: string;
  variant_name?: string;  // Added variant name
  year: number;
  color: string;
  price: number;
  description: string;
  image: string | null;
  created_at: string;
  images: CarImage[];
  body_type: string;
  is_used: boolean;
  drivetrain: string;
  seats: number;
  doors: number;
  mileage: number;
  first_registration: string | null;
  general_inspection_date: string | null;
  full_service_history: boolean;
  customs_paid: boolean;
  power: number;
  gearbox: string;
  engine_size: number;
  gears: number;
  cylinders: number;
  weight: number;
  emission_class: string;
  fuel_type: string;
  options: string[];
}

export interface CarImage {
  id: number;
  image: string;
  is_primary?: boolean;
  order?: number;
}

export interface TempImage {
  id: number;
  file: File;
  preview: string;
}

export interface Make {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  name: string;
  make: number;
  variants?: Variant[];  // Added variants relationship
}

export interface Variant {  // Added Variant interface
  id: number;
  name: string;
  model: number;
}

export interface FormData {
  make: string;
  model: string;
  variant?: string;       // Added variant
  brand?: string;   
  model_name?: string;
  variant_name?: string;  // Added variant_name
  year: number;
  color: string;
  price: number;
  description: string;
  image: File | null;
  created_at: string;
  body_type: string;
  is_used: boolean;
  drivetrain: string;
  seats: number;
  doors: number;
  mileage: number;
  first_registration: string;
  general_inspection_date: string;
  full_service_history: boolean;
  customs_paid: boolean;
  power: number;
  gearbox: string;
  engine_size: number;
  gears: number;
  cylinders: number;
  weight: number;
  emission_class: string;
  fuel_type: string;
  options: string[];
  images: CarImage[];
}