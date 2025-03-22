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

# Check for broken migrations and fix them
if [ -f api/migrations/0012_populate_existing_slugs.py ]; then
  echo "Found migration 0012 with broken dependency - fixing..."
  
  # Find the latest actual migration before 0012
  LATEST_MIGRATION=$(find api/migrations -name "*.py" | grep -v "__init__" | grep -v "0012_" | sort -V | tail -n 1)
  LATEST_MIGRATION_NUM=$(basename $LATEST_MIGRATION | cut -d'_' -f1)
  LATEST_MIGRATION_NAME=$(basename $LATEST_MIGRATION .py | cut -d'_' -f2-)
  
  echo "Latest valid migration: $LATEST_MIGRATION ($LATEST_MIGRATION_NUM - $LATEST_MIGRATION_NAME)"
  
  # Update 0012 to depend on the latest actual migration
  sed -i "s/('api', '0011_car_slug_carimage_public_id_alter_carimage_image')/('api', '${LATEST_MIGRATION_NUM}_${LATEST_MIGRATION_NAME}')/g" api/migrations/0012_populate_existing_slugs.py
  
  # Do the same for 0013 if it exists
  if [ -f api/migrations/0013_safe_carimage_fields.py ]; then
    echo "Found migration 0013 - updating it to depend on 0012"
    sed -i "s/('api', '[^']*')/('api', '0012_populate_existing_slugs')/g" api/migrations/0013_safe_carimage_fields.py
  fi
fi

# If there are no migration files at all, create initial migrations
MIGRATION_COUNT=$(find api/migrations -name "*.py" | grep -v "__init__" | wc -l)
if [ "$MIGRATION_COUNT" -eq 0 ]; then
  echo "No migrations found - creating initial migrations..."
  python manage.py makemigrations
  python manage.py makemigrations api
fi

# Now run the actual migrations
echo "Running migrations..."
python manage.py migrate

# Create a simple migration to ensure Car has a slug field
cat > ensure_car_slug.py << 'EOF'
from django.db import migrations, models
import uuid
from django.utils.text import slugify

def generate_slugs_for_existing_cars(apps, schema_editor):
    """
    Generate slugs for all existing Car objects that don't have one
    """
    Car = apps.get_model('api', 'Car')
    
    for car in Car.objects.filter(slug__isnull=True) | Car.objects.filter(slug=''):
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
        car.save()

# Run this script directly
try:
    import django
    django.setup()
    from django.apps import apps
    Car = apps.get_model('api', 'Car')
    from django.utils.text import slugify
    import uuid
    
    # Check if slug field exists and populate it
    if hasattr(Car, 'slug'):
        print("Generating slugs for cars without slugs...")
        generate_slugs_for_existing_cars(None, None)
    else:
        print("Car model doesn't have slug field yet - skipping slug generation")
except Exception as e:
    print(f"Error running slug script: {str(e)}")
EOF

# Run the script to ensure slug field is populated
python ensure_car_slug.py

# Uncomment these if you need to run your data initialization scripts
# python manage.py init_car_data
# python manage.py init_colors_options

# Create superuser if environment variable is set
#if [[ $CREATE_SUPERUSER ]]; then
#    python manage.py createsuperuser --noinput
#fi

# Cleanup
rm -f ensure_car_slug.py