#!/bin/bash

echo "🧪 Testing Korean Fitness App API"
echo "================================"

API_URL="http://localhost:3000/api"

# Test health endpoint
echo -e "\n1. Testing Health Endpoint:"
curl -s http://localhost:3000/health | python3 -m json.tool || echo "Health check failed"

# Test registration
echo -e "\n2. Testing User Registration:"
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#"
  }' | python3 -m json.tool || echo "Registration failed"

# Save the token for authenticated requests
echo -e "\n3. Testing Login:"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }')

echo $LOGIN_RESPONSE | python3 -m json.tool || echo "Login failed"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import json, sys; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)

if [ ! -z "$TOKEN" ]; then
  echo -e "\n✅ Authentication successful! Token received."
  
  # Test authenticated endpoint
  echo -e "\n4. Testing Workout Analytics (Authenticated):"
  curl -s -X GET $API_URL/analytics/workout-analytics \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool || echo "Analytics request failed"
else
  echo -e "\n❌ Authentication failed. Could not get token."
fi

echo -e "\n✅ API test complete!"