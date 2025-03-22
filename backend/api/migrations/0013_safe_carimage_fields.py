# Create a new migration file (0013_safe_carimage_fields.py)

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_populate_existing_slugs'),  # Update with your latest migration
    ]

    operations = [
        # First, check if public_id doesn't exist before adding it
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
            reverse_sql="""
            -- No reverse operation needed
            """
        ),
        
        # Then update any remaining CarImage fields safely
        migrations.AlterField(
            model_name='carimage',
            name='public_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]