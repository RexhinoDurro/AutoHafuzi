# backend/verify_cars.py
# Run this script to verify your cars and generate slugs if needed

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Car
from django.utils.text import slugify
import uuid

def verify_and_fix_cars():
    """Verify car data and fix any issues"""
    cars = Car.objects.all()
    print(f"Found {cars.count()} cars in the database")
    
    cars_without_slugs = cars.filter(slug__in=['', None])
    print(f"Cars without slugs: {cars_without_slugs.count()}")
    
    for car in cars_without_slugs:
        try:
            # Create base for the slug
            base_slug = f"{car.make.name}-{car.model.name}"
            
            # Add variant if available
            if car.variant:
                base_slug += f"-{car.variant.name}"
                
            # Add year if available
            if car.first_registration_year:
                base_slug += f"-{car.first_registration_year}"
                
            # Add a unique identifier
            unique_id = uuid.uuid4().hex[:6]
            base_slug += f"-{unique_id}"
            
            # Slugify
            new_slug = slugify(base_slug)
            
            # Ensure uniqueness
            counter = 1
            original_slug = new_slug
            while Car.objects.filter(slug=new_slug).exists():
                new_slug = f"{original_slug}-{counter}"
                counter += 1
            
            car.slug = new_slug
            car.save(update_fields=['slug'])
            print(f"Fixed slug for car {car.id}: {new_slug}")
            
        except Exception as e:
            print(f"Error fixing car {car.id}: {e}")
            # Fallback
            car.slug = f"car-{car.id}-{uuid.uuid4().hex[:6]}"
            car.save(update_fields=['slug'])
            print(f"Used fallback slug for car {car.id}: {car.slug}")

if __name__ == "__main__":
    verify_and_fix_cars()
    print("Verification complete!")