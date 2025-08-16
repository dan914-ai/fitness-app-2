# Quick Test Login for Progression Features

Since you're not logged in, here's how to quickly test the progression features:

## Option 1: Use Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Create a test user manually
4. Use those credentials to log in to your app

## Option 2: Add a Test Login Button
Add this temporary code to your HomeScreen to create a test login:

```typescript
// Add this function in HomeScreen
const testLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  
  if (error) {
    // Try to create the user first
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (signUpError) {
      console.error('Sign up error:', signUpError);
    } else {
      console.log('User created and logged in:', signUpData);
      getUserId(); // Refresh user ID
    }
  } else {
    console.log('Logged in:', data);
    getUserId(); // Refresh user ID
  }
};

// Add this button in your JSX (temporarily)
<TouchableOpacity 
  style={[styles.quickActionButton, { backgroundColor: '#2196F3' }]} 
  onPress={testLogin}
>
  <Icon name="login" size={24} color="#FFFFFF" />
  <Text style={styles.quickActionText}>Test Login</Text>
</TouchableOpacity>
```

## Option 3: Check if you have Auth implemented
Look for screens like:
- LoginScreen
- AuthScreen
- SignInScreen
- ProfileScreen (might have login option)

The progression features require a logged-in user because they:
- Store personal workout data
- Track individual recovery metrics
- Provide personalized suggestions based on YOUR history