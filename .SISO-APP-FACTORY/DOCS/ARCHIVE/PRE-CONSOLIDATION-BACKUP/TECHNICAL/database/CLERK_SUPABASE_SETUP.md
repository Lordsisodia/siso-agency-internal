# 🔗 Clerk + Supabase Integration Setup

This guide walks through connecting Clerk authentication with Supabase Row Level Security.

## 1. Clerk JWT Template Configuration

### Step 1: Create Supabase JWT Template in Clerk Dashboard

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **JWT Templates** in the left sidebar
3. Click **+ New Template**
4. Choose **Supabase** from the presets or **Create Custom**

### Step 2: Configure the JWT Template

**Template Name:** `supabase`

**Claims:**
```json
{
  "aud": "authenticated",
  "exp": {{exp}},
  "iat": {{iat}},
  "iss": "{{iss}}",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "phone": "{{user.primary_phone_number.phone_number}}",
  "user_metadata": {
    "email": "{{user.primary_email_address.email_address}}",
    "first_name": "{{user.first_name}}",
    "last_name": "{{user.last_name}}",
    "full_name": "{{user.full_name}}"
  }
}
```

## 2. Supabase Configuration

### Step 1: Configure Supabase Auth Settings

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** > **Settings**
3. Scroll to **JWT Settings**

### Step 2: Add Clerk as JWT Provider

**JWT Secret:** Your Clerk JWT verification key (found in Clerk Dashboard > API Keys)

**JWT Verification:** Enable external JWT verification

## 3. Environment Variables

Add these to your `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Configuration (if not already present)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## 4. Run SQL Setup Script

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase-rls-setup.sql` from this project
4. Copy and paste the entire content into the SQL Editor
5. Click **Run** to execute the Row Level Security setup

## 5. Test the Integration

### Step 1: Check Authentication Flow

1. Start your development server
2. Sign in with Clerk
3. Check browser console for `🔐 Authenticated Supabase client created` message

### Step 2: Verify Database Queries

1. Try creating a task in the app
2. Check Supabase Dashboard **Table Editor** to see if data appears
3. Verify that RLS is working by checking only your user's data is accessible

## 6. Troubleshooting

### Common Issues:

**JWT Token Issues:**
- Verify Clerk JWT template name matches the one used in code (`supabase`)
- Check that JWT claims include the correct user ID in `sub` field

**RLS Policy Issues:**
- Ensure all tables have RLS enabled
- Verify JWT `sub` claim matches the `userId` field in your tables

**Environment Variables:**
- Double-check all Supabase and Clerk environment variables
- Restart development server after adding new env vars

### Debug Commands:

```javascript
// In browser console, check if JWT token is being generated:
const token = await window.Clerk.session.getToken({template: 'supabase'});
console.log('JWT Token:', token);

// Check if Supabase client is authenticated:
console.log('Supabase Client:', supabase.auth.user());
```

## 7. Security Notes

- **Never expose JWT secrets** in client-side code
- **Row Level Security** ensures users can only access their own data
- **JWT tokens expire** - the hook handles refresh automatically
- **Test RLS policies** thoroughly before deploying to production

## Next Steps

Once this setup is complete, you can:

1. Remove the Express server entirely
2. Update all remaining hooks to use Supabase directly
3. Deploy to Vercel with Supabase backend

✅ **Your Clerk + Supabase integration is now complete!**