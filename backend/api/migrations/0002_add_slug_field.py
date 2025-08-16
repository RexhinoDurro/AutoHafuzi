from django.db import migrations, models
from django.utils.text import slugify
import uuid

def generate_unique_slugs(apps, schema_editor):
    """Generate unique slugs for existing cars"""
    Car = apps.get_model('api', 'Car')
    CarMake = apps.get_model('api', 'CarMake')
    CarModel = apps.get_model('api', 'CarModel')
    CarVariant = apps.get_model('api', 'CarVariant')
    
    for car in Car.objects.all():
        try:
            # Get related objects
            make = CarMake.objects.get(id=car.make_id)
            model = CarModel.objects.get(id=car.model_id)
            variant = None
            if car.variant_id:
                variant = CarVariant.objects.get(id=car.variant_id)
            
            # Create base for the slug
            base_slug = f"{make.name}-{model.name}"
            
            # Add variant if available
            if variant:
                base_slug += f"-{variant.name}"
                
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
            
        except Exception as e:
            # Fallback: use car ID
            car.slug = f"car-{car.id}-{uuid.uuid4().hex[:6]}"
            car.save(update_fields=['slug'])

def reverse_slugs(apps, schema_editor):
    """Reverse operation"""
    Car = apps.get_model('api', 'Car')
    Car.objects.all().update(slug='')

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        # Step 1: Add slug field as nullable first
        migrations.AddField(
            model_name='car',
            name='slug',
            field=models.SlugField(blank=True, max_length=255, null=True),
        ),
        
        # Step 2: Populate slugs for existing cars
        migrations.RunPython(
            generate_unique_slugs,
            reverse_slugs,
        ),
        
        # Step 3: Make slug field required and unique
        migrations.AlterField(
            model_name='car',
            name='slug',
            field=models.SlugField(max_length=255, unique=True),
        ),
    ]