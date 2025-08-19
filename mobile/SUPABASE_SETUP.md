# Supabase Setup Instructions

This app is production-ready and requires a Supabase backend. Follow these steps to set it up:

## 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or use existing one
3. Note your project URL and anon key

## 2. Update Environment Variables

Update the `.env` file with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Run Database Migration

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `supabase/migrations/001_create_all_tables.sql`
4. Click "Run" to execute the migration

This will create all necessary tables with proper:
- Table structure
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic calculations
- User profile management

## 4. Enable Authentication

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Email provider (should be enabled by default)
3. Configure email templates if needed

## 5. Test the App

1. Start the app: `npm run web`
2. You can now:
   - Create new accounts with real email
   - Use test account button for quick testing
   - All data will be persisted in Supabase

## Features Included

### Database Tables
- `user_profiles` - User profile information
- `user_doms_data` - DOMS (recovery) survey data
- `user_session_data` - Workout session RPE data
- `workout_history` - Complete workout records
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual set data
- `inbody_history` - Body composition tracking
- `workout_programs` - Available workout programs
- `program_enrollments` - User program enrollments

### Security Features
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic user profile creation on signup
- Secure authentication flow

### Automatic Features
- Readiness score calculation from DOMS data
- User profile creation on signup
- Timestamp management
- Data validation constraints

## Production Deployment

For production deployment:

1. **Environment Variables**: Ensure all environment variables are set in your deployment platform
2. **Database Backup**: Set up regular database backups in Supabase
3. **Monitoring**: Enable Supabase monitoring and alerts
4. **Rate Limiting**: Configure rate limiting if needed
5. **Email**: Set up custom SMTP for production emails

## Troubleshooting

### Authentication Issues
- If login fails with "Email not confirmed", the app will still allow temporary access
- Check Supabase logs for detailed error messages

### Database Issues
- Ensure all migrations have run successfully
- Check RLS policies are not blocking access
- Verify indexes are created for performance

### Data Not Persisting
- Check browser console for errors
- Verify Supabase connection
- Ensure RLS policies allow the operation

## Support

For issues:
1. Check Supabase logs in the Dashboard
2. Verify all environment variables are correct
3. Ensure database migrations completed successfully
4. Check browser console for detailed error messages