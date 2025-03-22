#!/usr/bin/env bash
set -o errexit

# Change to the script's directory
cd "$(dirname "$0")"

# Create necessary directories
mkdir -p staticfiles media

# Install Python dependencies
pip install -r requirements.txt

# Run Django commands
python manage.py collectstatic --noinput

# Generate and apply migrations safely
# First, check if there are any model changes to migrate
python manage.py makemigrations --dry-run | grep -q "No changes detected" || {
    # Create a safe migration for the slug and public_id fields
    python manage.py makemigrations api --empty --name safe_column_additions
    
    # Edit the generated migration file to safely check if columns exist before adding them
    MIGRATION_FILE=$(find api/migrations -name "*safe_column_additions.py" | sort -r | head -n 1)
    
    # Replace the migration content with our safe SQL operations
    cat > $MIGRATION_FILE << 'EOF'
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('api', '__previous_migration__'),  # Will be automatically filled by makemigrations
    ]
    
    operations = [
        # Safely check if slug doesn't exist before adding it to Car model
        migrations.RunSQL(
            sql="""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'api_car' 
                    AND column_name = 'slug'
                ) THEN
                    ALTER TABLE api_car ADD COLUMN slug character varying(255) NULL;
                END IF;
            END $$;
            """,
            reverse_sql="-- No reverse operation needed"
        ),
        
        # Safely check if public_id doesn't exist before adding it to CarImage model
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
    ]
EOF
    
    # Now run normal migrations
    python manage.py makemigrations
    python manage.py makemigrations api
}

# Apply migrations
python manage.py migrate

# Create a data migration to populate missing slugs if needed
if python manage.py shell -c "from api.models import Car; print(Car.objects.filter(slug__isnull=True).count() + Car.objects.filter(slug='').count())" | grep -q "[^0]"; then
    echo "Found cars with missing slugs - creating data migration to populate them"
    python manage.py makemigrations api --empty --name populate_missing_slugs
    
    # Get the latest migration file
    SLUG_MIGRATION_FILE=$(find api/migrations -name "*populate_missing_slugs.py" | sort -r | head -n 1)
    
    # Replace the migration content with our slug population script
    cat > $SLUG_MIGRATION_FILE << 'EOF'
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
        ('api', '__previous_migration__'),  # Will be automatically filled by makemigrations
    ]

    operations = [
        migrations.RunPython(populate_missing_slugs),
    ]
EOF
    
    # Apply the data migration
    python manage.py migrate api
fi

# Uncomment these if you need to run your data initialization scripts
# python manage.py init_car_data
# python manage.py init_colors_options

# Create superuser if environment variable is set
#if [[ $CREATE_SUPERUSER ]]; then
#    python manage.py createsuperuser --noinput
#fi