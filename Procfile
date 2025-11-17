# Procfile for Railway deployment
# Defines process types for the application

# Web process: Run the Django application with Gunicorn
web: cd backend && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 60 --access-logfile - --error-logfile -

# Release process: Run database migrations before deployment
release: cd backend && python manage.py migrate --noinput

# Optional: Worker process for Celery (uncomment if using)
# worker: cd backend && celery -A config worker --loglevel=info

# Optional: Beat process for Celery periodic tasks (uncomment if using)
# beat: cd backend && celery -A config beat --loglevel=info
