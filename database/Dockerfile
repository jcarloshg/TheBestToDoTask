FROM postgres:16-alpine

# Set default environment variables (can be overridden by docker-compose .env.dev, .env.prod, etc.)

# Copy initialization script and migration files to the initialization directory
COPY migrations/ /docker-entrypoint-initdb.d/

EXPOSE 5432
