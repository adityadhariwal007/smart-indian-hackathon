#!/usr/bin/env bash
# ==============================================================================
# HealthFlow AI Backend Runner Script
# ==============================================================================
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/.."

echo "Starting HealthFlow AI Symptom Assessment & Navigation Backend..."
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "Error: Python 3 is required but not installed."
    exit 1
fi

# Run with uvicorn
$PYTHON_CMD -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
