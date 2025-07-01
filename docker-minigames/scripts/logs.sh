#!/bin/bash

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

show_help() {
  echo "Usage: $0 [SERVICE] [OPTIONS]"
  echo ""
  echo "Services:"
  echo "  all       Show all service logs (default)"
  echo "  frontend  Show frontend logs only"
  echo "  backend   Show backend logs only"
  echo ""
  echo "Options:"
  echo "  -f, --follow   Follow log output"
  echo "  -t, --tail N   Show last N lines (default: 100)"
  echo "  -h, --help     Show this help"
  echo ""
  echo "Examples:"
  echo "  $0                    # Show last 100 lines of all logs"
  echo "  $0 backend -f         # Follow backend logs"
  echo "  $0 frontend -t 50     # Show last 50 lines of frontend logs"
}

SERVICE="all"
FOLLOW=""
TAIL="100"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
  frontend | backend | all)
    SERVICE="$1"
    shift
    ;;
  -f | --follow)
    FOLLOW="-f"
    shift
    ;;
  -t | --tail)
    TAIL="$2"
    shift 2
    ;;
  -h | --help)
    show_help
    exit 0
    ;;
  *)
    echo "Unknown option: $1"
    show_help
    exit 1
    ;;
  esac
done

echo -e "${BLUE}📋 Docker Quiz Game Logs${NC}"
echo -e "${BLUE}Service: $SERVICE | Tail: $TAIL lines${NC}"

if [ -n "$FOLLOW" ]; then
  echo -e "${GREEN}Following logs (Press Ctrl+C to stop)...${NC}"
fi

echo "----------------------------------------"

case $SERVICE in
"all")
  docker-compose logs $FOLLOW --tail=$TAIL
  ;;
"frontend" | "backend")
  docker-compose logs $FOLLOW --tail=$TAIL $SERVICE
  ;;
esac
