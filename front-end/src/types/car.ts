export interface Car {
  id: number;
  make_id: number;
  model_id: number;
  variant_id?: number;
  brand: string;
  model_name: string;
  variant_name?: string;
  year: number;
  exterior_color_id?: number;
  exterior_color_name?: string;
  exterior_color_hex?: string;
  interior_color_id?: number;
  interior_color_name?: string;
  interior_upholstery?: string;
  interior_color_hex?: string;
  price: number;
  description: string;
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
  upholstery: string;
  hex_code: string;
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
  year: number;
  exterior_color?: string;
  exterior_color_id?: number;
  exterior_color_name?: string;
  exterior_color_hex?: string;
  interior_color?: string;
  interior_color_id?: number;
  interior_color_name?: string;
  interior_color_hex?: string;
  interior_upholstery?: string;
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
  option_ids?: number[];
  images: CarImage[];
}