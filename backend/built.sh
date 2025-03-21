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
python manage.py migrate

# Uncomment these if you need to run your data initialization scripts
# python manage.py init_car_data
# python manage.py init_colors_options

# Create superuser if environment variable is set
#if [[ $CREATE_SUPERUSER ]]; then
#    python manage.py createsuperuser --noinput
#fi