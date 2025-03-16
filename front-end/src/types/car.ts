export interface Car {
  id: number;
  make: number;
  model: number;
  variant?: number;
  brand: string;
  model_name: string;
  variant_name?: string;
  exterior_color?: number;
  exterior_color_name?: string;
  exterior_color_hex?: string;
  interior_color?: number;
  interior_color_name?: string;
  interior_color_hex?: string;
  upholstery?: number;  // New field for upholstery ID
  upholstery_name?: string;  // New field for upholstery name
  price: number;
  discussed_price?: boolean;
  description: string;
  created_at: string;
  images: CarImage[];
  body_type: string;
  is_used: boolean;
  drivetrain: string;
  seats: number;
  doors: number;
  mileage: number;
  first_registration_day?: number;
  first_registration_month?: number;
  first_registration_year?: number;
  first_registration?: string;
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
  options: string[] | number[];
  view_count: number; 
}

export interface CarImage {
  id: number;
  image: string;
  is_primary?: boolean;
  order?: number;
  url?: string;
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
  variants?: Variant[];
}

export interface Variant {
  id: number;
  name: string;
  model: number;
}

export interface ExteriorColor {
  id: number;
  name: string;
  hex_code: string;
}

export interface InteriorColor {
  id: number;
  name: string;
  hex_code: string;
}

// New interface for Upholstery
export interface Upholstery {
  id: number;
  name: string;
}

export interface Option {
  id: number;
  name: string;
  category: string;
  category_display?: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface FormData {
  make: string;
  model: string;
  variant?: string;
  make_id?: number;
  model_id?: number;
  variant_id?: number;
  brand?: string;   
  model_name?: string;
  variant_name?: string;
  exterior_color?: string;
  exterior_color_id?: number;
  exterior_color_name?: string;
  exterior_color_hex?: string;
  interior_color?: string;
  interior_color_id?: number;
  interior_color_name?: string;
  interior_color_hex?: string;
  upholstery_id?: number;  // New field for upholstery ID
  upholstery_name?: string;  // New field for upholstery name
  price: number;
  discussedPrice?: boolean;
  description: string;
  image: File | null;
  created_at: string;
  body_type: string;
  is_used: boolean;
  drivetrain: string;
  seats: number;
  doors: number;
  mileage: number;
  first_registration_day?: number;
  first_registration_month?: number;
  first_registration_year?: number;
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
  option_ids?: number[];
  images: CarImage[];
}