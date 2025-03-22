# Create a data migration file (0012_populate_existing_slugs.py)

from django.db import migrations
from django.utils.text import slugify
import uuid

def populate_missing_slugs(apps, schema_editor):
    """Generate slugs for cars that don't have them yet"""
    Car = apps.get_model('api', 'Car')
    
    # Get all cars with empty slugs
    cars_without_slugs = Car.objects.filter(slug__isnull=True) | Car.objects.filter(slug='')
    
    for car in cars_without_slugs:
        # Create base for the slug
        base_slug = f"{car.make.name}-{car.model.name}"
        
        # Add variant if available
        if car.variant:
            base_slug += f"-{car.variant.name}"
            
        # Add year if available
        if car.first_registration_year:
            base_slug += f"-{car.first_registration_year}"
            
        # Add a unique identifier (last 6 chars of UUID)
        unique_id = uuid.uuid4().hex[:6]
        base_slug += f"-{unique_id}"
        
        # Slugify and save
        car.slug = slugify(base_slug)
        car.save(update_fields=['slug'])

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_car_slug_carimage_public_id_alter_carimage_image'),  # Update with your latest migration
    ]

    operations = [
        migrations.RunPython(populate_missing_slugs),
    ]