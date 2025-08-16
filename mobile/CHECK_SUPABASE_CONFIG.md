# Check Your Supabase Configuration

## 1. In Supabase Dashboard, check API Settings:

Go to **Settings > API** and verify:

- **Project URL**: Should match `https://nwpyliujuimufkfjolsj.supabase.co`
- **API Settings**: Make sure it's enabled
- **Exposed schemas**: Should include `public` (this is crucial!)

## 2. Check Table Editor

Go to **Table Editor** in your Supabase Dashboard:
- Do you see `test_table`?
- Do you see `user_doms_data`?
- Do you see `doms_surveys`?

## 3. Try Direct API Test

Open a new browser tab and go to:
```
https://nwpyliujuimufkfjolsj.supabase.co/rest/v1/
```

You should see a Swagger/OpenAPI documentation page. Check if any tables are listed there.

## 4. Quick Fix - Use Supabase Table Editor

Instead of SQL Editor, try creating the table through the UI:

1. Go to **Table Editor**
2. Click **New Table**
3. Name: `user_doms_data`
4. Add columns:
   - `id` (int8, primary key)
   - `user_id` (uuid)
   - `chest_soreness` (int2)
   - `back_soreness` (int2)
   - `legs_soreness` (int2)
   - `arms_soreness` (int2)
   - `shoulders_soreness` (int2)
   - `core_soreness` (int2)
   - `overall_soreness` (int2)
   - `sleep_quality` (int2)
   - `energy_level` (int2)
   - `motivation` (int2)
   - `survey_date` (date)
   - `created_at` (timestamptz)

5. Disable RLS for now

## Common Issues:

1. **Wrong Project**: Make sure you're in the correct Supabase project
2. **API Disabled**: Check if API access is enabled in project settings
3. **Schema Not Exposed**: The `public` schema might not be exposed to the API
4. **Connection String Mismatch**: Your app might be connecting to a different project

## Test with cURL:

Try this in your terminal:
```bash
curl https://nwpyliujuimufkfjolsj.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Replace YOUR_ANON_KEY with your actual anon key from Supabase dashboard.