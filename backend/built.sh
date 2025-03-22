#!/usr/bin/env bash
set -o errexit

# Change to the script's directory
cd "$(dirname "$0")"

# Create necessary directories
mkdir -p staticfiles media

# Install Python dependencies
pip install -r requirements.txt

# Run Django collectstatic
python manage.py collectstatic --noinput

echo "Fixing migration dependencies..."

# Remove problematic migrations
rm -f api/migrations/0011_car_slug_carimage_public_id_alter_carimage_image.py 2>/dev/null || true
rm -f api/migrations/0012_populate_existing_slugs.py 2>/dev/null || true
rm -f api/migrations/0013_safe_carimage_fields.py 2>/dev/null || true

echo "Creating new migration based on 0010_upholstery..."

# Create a new migration to add the slug field
cat > api/migrations/0011_add_slug_and_public_id_fields.py << 'EOF'
# Generated manually to fix migration issues

from django.db import migrations, models
import uuid
from django.utils.text import slugify

def generate_slugs_for_existing_cars(apps, schema_editor):
    """Generate slugs for all existing Car objects"""
    Car = apps.get_model('api', 'Car')
    
    for car in Car.objects.all():
        if not car.slug:
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
        ('api', '0010_upholstery'),  # Explicit dependency on 0010_upholstery
    ]

    operations = [
        # Safely add the slug field to Car model if it doesn't exist
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'api_car' 
                    AND column_name = 'slug'
                ) THEN
                    ALTER TABLE api_car ADD COLUMN slug character varying(255);
                    -- Add unique constraint to ensure no duplicates
                    CREATE UNIQUE INDEX api_car_slug_unique ON api_car(slug);
                END IF;
            END $$;
            """,
            reverse_sql="-- No reverse operation needed"
        ),
        
        # Safely add the public_id field to CarImage if it doesn't exist
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'api_carimage' 
                    AND column_name = 'public_id'
                ) THEN
                    ALTER TABLE api_carimage ADD COLUMN public_id character varying(255) NULL;
                END IF;
            END $$;
            """,
            reverse_sql="-- No reverse operation needed"
        ),
        
        # Run the slug population function
        migrations.RunPython(generate_slugs_for_existing_cars),
    ]
EOF

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Uncomment these if you need to run your data initialization scripts
# python manage.py init_car_data
# python manage.py init_colors_options

# Create superuser if environment variable is set
#if [[ $CREATE_SUPERUSER ]]; then
#    python manage.py createsuperuser --noinput
#fi