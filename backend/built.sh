set -o errexit

# Change to the script's directory
cd "$(dirname "$0")"

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
#python manage.py init_car_data
#python manage.py init_colors_options

# if [[ $CREATE_SUPERUSER ]]; then
#     python manage.py createsuperuser --noinput
# fi