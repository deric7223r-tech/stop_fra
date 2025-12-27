#!/bin/bash
# Database Status Check Script

echo "========================================"
echo "Stop FRA Database Status Check"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Check PostgreSQL is running
echo -e "${BLUE}1. PostgreSQL Service Status:${NC}"
if pg_isready -q; then
  echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
  echo -e "${RED}❌ PostgreSQL is not running${NC}"
  exit 1
fi
echo ""

# 2. Check database exists
echo -e "${BLUE}2. Database Connection:${NC}"
if psql -d stopfra_dev -c "SELECT 1" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Database 'stopfra_dev' is accessible${NC}"
else
  echo -e "${RED}❌ Cannot connect to 'stopfra_dev'${NC}"
  exit 1
fi
echo ""

# 3. Check tables
echo -e "${BLUE}3. Database Tables:${NC}"
TABLE_COUNT=$(psql -d stopfra_dev -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
echo -e "${GREEN}✅ Found ${TABLE_COUNT} tables${NC}"
psql -d stopfra_dev -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
echo ""

# 4. Check seed data
echo -e "${BLUE}4. Seed Data (Packages):${NC}"
PACKAGE_COUNT=$(psql -d stopfra_dev -t -c "SELECT COUNT(*) FROM packages;")
echo -e "${GREEN}✅ Found ${PACKAGE_COUNT} packages${NC}"
psql -d stopfra_dev -c "SELECT package_type, name, price FROM packages ORDER BY price;"
echo ""

# 5. Check record counts
echo -e "${BLUE}5. Record Counts:${NC}"
psql -d stopfra_dev -c "
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'organisations', COUNT(*) FROM organisations
UNION ALL
SELECT 'assessments', COUNT(*) FROM assessments
UNION ALL
SELECT 'packages', COUNT(*) FROM packages
UNION ALL
SELECT 'purchases', COUNT(*) FROM purchases
UNION ALL
SELECT 'keypasses', COUNT(*) FROM keypasses
ORDER BY table_name;
"
echo ""

# 6. Check environment
echo -e "${BLUE}6. Environment Configuration:${NC}"
if [ -f "backend/.env" ]; then
  echo -e "${GREEN}✅ .env file exists${NC}"
  echo "DATABASE_URL: $(grep DATABASE_URL backend/.env | cut -d'=' -f2)"
else
  echo -e "${RED}❌ .env file missing${NC}"
fi
echo ""

echo "========================================"
echo -e "${GREEN}✅ Database Status Check Complete${NC}"
echo "========================================"
