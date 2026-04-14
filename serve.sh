#!/bin/bash
PORT=${1:-8850}
# Kill any existing server on the port
lsof -ti :$PORT | xargs kill 2>/dev/null
sleep 0.3
echo "Starting server on http://localhost:$PORT"
python3 -m http.server $PORT
