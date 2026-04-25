#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Removing all CRM services and volumes...${NC}"

docker-compose down -v

echo -e "${GREEN}All services and volumes removed!${NC}"
