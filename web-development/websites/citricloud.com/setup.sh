#!/bin/bash

# CITRICLOUD Setup Script

echo "🚀 Setting up CITRICLOUD..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Installing..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "⚠️  Redis is not installed. Installing..."
    sudo apt update
    sudo apt install -y redis-server
fi

echo ""
echo "📦 Installing Backend Dependencies..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "🗄️  Setting up Database..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp ../.env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
fi

# Create PostgreSQL database
sudo -u postgres psql -c "CREATE DATABASE citricloud;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER citricloud WITH PASSWORD 'citricloud';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE citricloud TO citricloud;" 2>/dev/null

echo ""
echo "📦 Installing Frontend Dependencies..."
cd ../frontend

# Install npm packages
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn main:app --reload"
echo ""
echo "To start the frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "🎉 CITRICLOUD is ready!"
