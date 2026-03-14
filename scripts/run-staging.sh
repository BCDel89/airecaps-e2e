#!/bin/bash
# Run E2E tests against staging and open report
set -euo pipefail
cd "$(dirname "$0")/.."
npm test
echo ""
echo "Tests complete. Run 'npm run report' to view HTML report."
