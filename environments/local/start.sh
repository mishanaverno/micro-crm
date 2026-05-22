#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting CRM services...${NC}"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "docker-compose is not installed. Please install Docker Desktop or docker-compose."
    exit 1
fi

# Start services
docker-compose up -d --build

echo -e "${GREEN}Services started!${NC}"
echo ""
echo "PostgreSQL:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  User: crm_user"
echo "  Password: crm_password"
echo "  Database: crm_db"
echo ""
echo "Backend:"
echo "  URL: http://localhost:3000"
echo "  API: http://localhost:3000/api"
echo ""
echo "Frontend:"
echo "  URL: http://localhost:5173"
echo ""
echo "Auth:"
echo "  Me endpoint: http://localhost:3000/api/auth/me"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Stop and remove volumes: docker-compose down -v"
echo ""

echo "Service status:"
docker-compose ps
echo ""

echo "Migrator logs:"
if docker-compose ps -a migrator >/dev/null 2>&1; then
    docker-compose logs --tail=200 migrator || true
else
    echo "  Migrator service is not available."
fi
