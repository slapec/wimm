#!/usr/bin/env bash

./wait-for-it.sh db:5432 --strict

db_started=$?

if [ $db_started -ne 0 ]; then
  echo "db is not ready"
  exit $db_started
fi

python manage.py migrate --no-input

python manage.py collectstatic --no-input

uwsgi --ini uwsgi.ini
