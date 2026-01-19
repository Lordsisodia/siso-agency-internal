#!/bin/bash
# Test runner script for Blackbox 5 tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${GREEN}Blackbox 5 Test Runner${NC}"
echo "========================"
echo ""

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${RED}Error: pytest is not installed${NC}"
    echo "Install with: pip install pytest pytest-asyncio"
    exit 1
fi

# Default options
PYTEST_ARGS="-v"
COVERAGE=false
INTEGRATION=false
UNIT=false
SILENT=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -i|--integration)
            INTEGRATION=true
            shift
            ;;
        -u|--unit)
            UNIT=true
            shift
            ;;
        -s|--silent)
            SILENT=true
            PYTEST_ARGS=""
            shift
            ;;
        -h|--help)
            echo "Usage: run_tests.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -c, --coverage     Run tests with coverage report"
            echo "  -i, --integration  Run only integration tests"
            echo "  -u, --unit         Run only unit tests"
            echo "  -s, --silent       Run silently (minimal output)"
            echo "  -h, --help         Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./run_tests.sh                    # Run all tests"
            echo "  ./run_tests.sh -u                 # Run only unit tests"
            echo "  ./run_tests.sh -i -c              # Run integration tests with coverage"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use -h for help"
            exit 1
            ;;
    esac
done

# Build pytest command
PYTEST_CMD="pytest $PYTEST_ARGS"

# Add markers based on arguments
if [ "$UNIT" = true ]; then
    echo -e "${YELLOW}Running unit tests only...${NC}"
    PYTEST_CMD="$PYTEST_CMD -m unit"
elif [ "$INTEGRATION" = true ]; then
    echo -e "${YELLOW}Running integration tests only...${NC}"
    PYTEST_CMD="$PYTEST_CMD -m integration"
else
    echo -e "${YELLOW}Running all tests...${NC}"
fi

# Add coverage if requested
if [ "$COVERAGE" = true ]; then
    echo -e "${YELLOW}Coverage enabled...${NC}"
    PYTEST_CMD="$PYTEST_CMD --cov=../engine --cov-report=term-missing --cov-report=html"
fi

# Check for Redis
if ! redis-cli ping > /dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Redis is not running. Integration tests will be skipped.${NC}"
    echo "Start Redis with: redis-server"
fi

# Run tests
echo ""
echo -e "${GREEN}Running: $PYTEST_CMD${NC}"
echo ""

if eval $PYTEST_CMD; then
    echo ""
    echo -e "${GREEN}All tests passed!${NC}"

    if [ "$COVERAGE" = true ]; then
        echo ""
        echo -e "${GREEN}Coverage report generated in htmlcov/${NC}"
        echo "Open htmlcov/index.html in a browser to view."
    fi

    exit 0
else
    echo ""
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
