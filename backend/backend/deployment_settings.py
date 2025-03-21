import os
import dj_database_url
from .settings import *
from .settings import BASE_DIR


ALLOWED_HOSTS = [os.environ.get('RENDER_EXTERNAL_HOSTNAME')]
CSRF_TRUSTED_ORIGINS = ['https://'+ os.environ.get('RENDER_EXTERNAL_HOSTNAME')]

DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')

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

CORS_ALLOWED_ORIGINS = [
  "https://autohafuzi-fe.onrender.com",
]

# Add templates directory for index.html
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],  # Add this line to include templates
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

STORAGES = {
  "default": {
    "BACKEND": "django.core.files.storage.FileSystemStorage",
   },
  "staticfiles": {  # Changed from "static" to "staticfiles"
    "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
  },
}

DATABASES = {
    'default': dj_database_url.config(
      default=os.environ['DATABASE_URL'],
      conn_max_age=600
    )
}

# Make sure your React build files are properly collected
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'dist'),  # Point to Vite's dist folder instead of build
]

# This setting should already be in your file
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')