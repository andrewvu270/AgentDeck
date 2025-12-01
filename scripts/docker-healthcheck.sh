#!/bin/bash
# Health check script for Docker services

set -e

# Check PostgreSQL
echo "Checking PostgreSQL..."
docker-compose exec -T postgres pg_isready -U nexlab || exit 1

# Check Redis
echo "Checking Redis..."
docker-compose exec -T redis redis-cli ping || exit 1

# Check MinIO
echo "Checking MinIO..."
curl -f http://localhost:9000/minio/health/live || exit 1

echo "All services are healthy!"
