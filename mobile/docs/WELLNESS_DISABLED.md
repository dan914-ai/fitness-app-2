# Wellness Tab - Temporarily Disabled

## Status: DISABLED (Files Preserved)
Date: 2024-01-21

## What was disabled:
- **웰니스 (Wellness)** tab removed from bottom navigation
- All Wellness screens commented out but preserved

## Preserved Files (Not Deleted):
- `/src/screens/wellness/WellnessScreen.tsx` - Main wellness dashboard
- `/src/screens/wellness/NutritionTrackingScreen.tsx` - Nutrition & calorie tracking
- `/src/screens/home/WaterIntakeScreen.tsx` - Water intake tracking
- `/src/screens/calculators/MacroCalculatorScreen.tsx` - Macro calculator (also accessible from Menu)

## How to Re-enable:

1. In `/src/navigation/AppNavigator.tsx`:
   - Uncomment the Wellness imports (lines 67-68)
   - Uncomment WaterIntakeScreen import (line 61)
   - Uncomment the WellnessStackNavigator function (lines 293-334)
   - Uncomment the Wellness case in tab icon switch (lines 485-487)
   - Uncomment the Wellness Tab.Screen (lines 525-528)

## Features that were available:
- 수분 섭취 (Water Intake) tracking
- 영양 & 칼로리 (Nutrition & Calories) recording
- 매크로 계산기 (Macro Calculator)
- 신체 측정 (Body Measurements) - linked to Record tab

## Why Disabled:
- Per user request to hide Wellness functionality
- All code and files preserved for future use
- Can be re-enabled easily when needed

## Note:
MacroCalculator is still accessible through Menu tab as it's also registered there.