# 🔗 How to Integrate Progression Algorithm into Your App

## Step 1: Add RPE Modal Component

Create `src/components/RPEModal.tsx`:

```typescript
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Slider
} from 'react-native';
import progressionService from '../services/progression.service';

export default function RPEModal({ visible, onClose, workoutData, userId }) {
  const [rpe, setRPE] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await progressionService.logSessionRPE(
        userId,
        rpe,
        workoutData.exercises,
        workoutData.duration
      );
      onClose();
    } catch (error) {
      console.error('Failed to log RPE:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRPEDescription = (value: number) => {
    const descriptions = [
      'Rest', 'Very Light', 'Light', 'Light', 'Moderate', 
      'Moderate', 'Hard', 'Hard', 'Very Hard', 'Very Hard', 'Maximal'
    ];
    return descriptions[Math.round(value)];
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Rate Your Workout</Text>
          <Text style={styles.subtitle}>How hard was this session?</Text>
          
          <View style={styles.rpeContainer}>
            <Text style={styles.rpeValue}>{Math.round(rpe)}</Text>
            <Text style={styles.rpeDescription}>{getRPEDescription(rpe)}</Text>
          </View>

          <Slider
            value={rpe}
            onValueChange={setRPE}
            minimumValue={0}
            maximumValue={10}
            step={1}
            style={styles.slider}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Saving...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  rpeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  rpeValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  rpeDescription: {
    fontSize: 18,
    color: '#666',
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## Step 2: Update WorkoutCompleteScreen

Add RPE logging to your workout complete screen:

```typescript
// Add to imports
import RPEModal from '../../components/RPEModal';
import progressionService from '../../services/progression.service';
import { supabase } from '../../config/supabase';

// Inside your component, add:
const [showRPEModal, setShowRPEModal] = useState(true);
const [userId, setUserId] = useState<string | null>(null);

// Get user ID on mount
useEffect(() => {
  getUserId();
}, []);

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) setUserId(user.id);
};

// Add RPE Modal to render
return (
  <SafeAreaView style={styles.container}>
    {/* Your existing UI */}
    
    {userId && workout && (
      <RPEModal 
        visible={showRPEModal}
        onClose={() => setShowRPEModal(false)}
        workoutData={workout}
        userId={userId}
      />
    )}
  </SafeAreaView>
);
```

## Step 3: Add DOMS Survey to Home Screen

In your HomeScreen, add a morning check-in:

```typescript
// Check if user needs to fill DOMS survey
const checkDOMSSurvey = async () => {
  const today = new Date().toISOString().split('T')[0];
  const lastSurvey = await storageService.getItem('lastDOMSSurvey');
  
  if (lastSurvey !== today) {
    // Show DOMS survey modal or navigate to survey screen
    setShowDOMSSurvey(true);
  }
};
```

## Step 4: Use Progression Suggestions

When starting a new workout, get suggestions:

```typescript
const getWorkoutSuggestion = async (exerciseName: string, lastWeight: number) => {
  try {
    const suggestion = await progressionService.getProgressionSuggestion(
      userId,
      lastWeight,
      'compound'
    );
    
    // Use suggestion.suggested_load for the workout
    console.log(`Suggested weight: ${suggestion.suggested_load}kg`);
    console.log(`Reason: ${suggestion.reasoning}`);
    
    return suggestion.suggested_load;
  } catch (error) {
    console.error('Failed to get suggestion:', error);
    return lastWeight; // Fallback to last weight
  }
};
```

## That's It! 

After adding these components and refreshing your app:
- ✅ RPE modal will appear after workouts
- ✅ DOMS survey will show in the morning
- ✅ Weight suggestions will be personalized

**Without these integrations, refreshing won't show anything new!**