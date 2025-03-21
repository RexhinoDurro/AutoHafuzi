import os
import dj_database_url
from .settings import *
from .settings import BASE_DIR

# Allowed hosts and CSRF settings
ALLOWED_HOSTS = [os.environ.get('RENDER_EXTERNAL_HOSTNAME')]
CSRF_TRUSTED_ORIGINS = ['https://' + os.environ.get('RENDER_EXTERNAL_HOSTNAME')]

# Security settings
DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')

# Middleware configuration
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'api.middleware.SiteVisitMiddleware',
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
  "https://autohafuzi-fe.onrender.com",
]

# Add cloudinary to INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django_extensions',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'cloudinary_storage',  # Add this before django.contrib.staticfiles
    'django.contrib.staticfiles',
    'cloudinary',  # Add cloudinary
    'api',
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken',
]

# Templates configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Cloudinary configuration
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME', 'dka3gcr36'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY', '135938953269971'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET', 'x_ZYp9JhCW-HTYStn6ZoZhvTrK4')
}

# Media files configuration - Use Cloudinary for media
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# Static files configuration - Use both old and new settings syntax for compatibility
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# Database configuration
DATABASES = {
    'default': dj_database_url.config(
      default=os.environ['DATABASE_URL'],
      conn_max_age=600
    )
}

# Static files configuration
# IMPORTANT: Comment this out if the directory doesn't exist
# STATICFILES_DIRS = [
#    os.path.join(BASE_DIR, 'dist'),  # This directory doesn't exist on Render
# ]

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static root setting
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Security settings for production
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True