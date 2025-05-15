from pathlib import Path
import re

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

APP_NAME = 'allsafe'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-s0ny#s#3y=a31&%=-b&y1h+0*)-trnc#^=kst1u!o#n72w$q43'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'allsafe',
    "whitenoise.runserver_nostatic",
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_vite',
    'inertia',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # django inertia
    'inertia.middleware.InertiaMiddleware',
    # Inertia Share
    "allsafe.middleware.inertia_share",
]

STORAGES = {
    # ...
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

ROOT_URLCONF = 'allsafe.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates'
        ],
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

WSGI_APPLICATION = 'allsafe.wsgi.application'

# Database settings
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation settings
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization settings
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images) settings
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django inertia vite settings
INERTIA_LAYOUT = 'base.html'
CSRF_HEADER_NAME = 'HTTP_X_XSRF_TOKEN'
CSRF_COOKIE_NAME = 'XSRF-TOKEN'

# Where ViteJS assets are built.
DJANGO_VITE_ASSETS_PATH = BASE_DIR / 'src' / 'dist'

DJANGO_VITE_STATIC_URL_PREFIX = ''
DJANGO_VITE_DEV_MODE = DEBUG
DJANGO_VITE_DEV_SERVER_HOST = '0.0.0.0'
DJANGO_VITE_PORT = 3000

# Static root for collecting static files
STATIC_ROOT = BASE_DIR / "staticfiles"

# STATICFILES_DIRS settings - remove the problematic directory
STATICFILES_DIRS = [
    BASE_DIR / 'static',
    # DJANGO_VITE_ASSETS_PATH,  # Commented out due to directory non-existence
]

# Function to check immutable files
def immutable_file_test(path, url):
    # Match filename with 12 hex digits before the extension
    return re.match(r'^.+\.[0-9a-f]{12}\..+$', url)

WHITENOISE_IMMUTABLE_FILE_TEST = immutable_file_test
