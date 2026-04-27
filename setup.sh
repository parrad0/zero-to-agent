#!/bin/bash
# Setup script for The Afterlife Forum

# Create .env.local from example if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "Created .env.local from .env.example"
    echo "⚠️  Please add your OPENAI_API_KEY to .env.local"
else
    echo ".env.local already exists"
fi

# Check if OPENAI_API_KEY is set
if grep -q "your-api-key-here" .env.local 2>/dev/null; then
    echo "⚠️  Warning: OPENAI_API_KEY not set in .env.local"
fi

echo "Ready to run: npm run dev"