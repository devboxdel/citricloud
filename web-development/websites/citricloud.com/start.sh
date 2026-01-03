#!/bin/bash

# CITRICLOUD Start Script

echo "🚀 Starting CITRICLOUD..."

# Start Redis
echo "Starting Redis..."
sudo systemctl start redis-server 2>/dev/null || redis-server --daemonize yes

# Start Backend
echo "Starting Backend..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend
echo "Starting Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ CITRICLOUD is running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/api/v1/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
