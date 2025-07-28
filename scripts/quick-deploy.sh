#!/bin/bash

echo "🚀 Quick Production Deployment Script"
echo "===================================="

# Check if .env.production.local exists
if [ ! -f .env.production.local ]; then
    echo "❌ Error: .env.production.local not found!"
    echo "Please create it from .env.production.template"
    exit 1
fi

echo "✅ Environment file found"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema to Supabase
echo "🗄️  Pushing database schema to Supabase..."
npx prisma db push --skip-generate

echo "✅ Database ready!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Test the live site"
echo "2. Configure Stripe webhook in dashboard"
echo "3. Verify email sending works"
echo "4. Check /api/health endpoint"