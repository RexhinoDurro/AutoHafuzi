set -o errexit

# Change to the script's directory
cd "$(dirname "$0")"

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

if [[ $CREATE_SUPERUSER ]]; then
    python manage.py createsuperuser --noinput
fi