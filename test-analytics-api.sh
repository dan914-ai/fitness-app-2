#!/bin/bash

# Test Analytics API Endpoints

API_URL="http://localhost:3001/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTczODA5MTYwNiwiZXhwIjoxNzY5NjI3NjA2fQ.YUaCAQaKB4ULzhQoRxKoZzJo-STl-5pN6RMJ1_Rdbxc"

echo "🔍 Testing Analytics API Endpoints..."
echo "=================================="

# Test 1: Overall Stats
echo -e "\n1. Testing Overall Stats:"
curl -X GET "$API_URL/analytics/overall-stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | json_pp

# Test 2: Workout Frequency (30 days)
echo -e "\n2. Testing Workout Frequency (30 days):"
curl -X GET "$API_URL/analytics/workout-frequency?period=30" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | json_pp

# Test 3: Muscle Group Distribution
echo -e "\n3. Testing Muscle Group Distribution:"
curl -X GET "$API_URL/analytics/muscle-groups" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | json_pp

# Test 4: Personal Records
echo -e "\n4. Testing Personal Records:"
curl -X GET "$API_URL/analytics/personal-records" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | json_pp

# Test 5: Workout Trends
echo -e "\n5. Testing Workout Trends:"
curl -X GET "$API_URL/analytics/trends" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | json_pp

# Test 6: Exercise Progress (example: exercise ID 1)
echo -e "\n6. Testing Exercise Progress (Exercise ID 1):"
curl -X GET "$API_URL/analytics/exercise-progress/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | json_pp

echo -e "\n✅ All API tests completed!"