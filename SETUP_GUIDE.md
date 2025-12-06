# Quick Setup Guide

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (takes ~2 minutes)

## Step 2: Configure Environment Variables

1. In your Supabase project, go to **Project Settings** > **API**
2. Copy the **Project URL** and **anon public** key
3. Update `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click **Run**
5. You should see "Success. No rows returned"

## Step 4: Set Up Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name it `outfits`
4. Make it **Public**
5. Click **Create bucket**

### Configure Storage Policies

1. Click on the `outfits` bucket
2. Go to **Policies** tab
3. Click **New Policy** > **For full customization**
4. Create two policies:

**Policy 1: Public Read**
- Policy name: `Public can view outfits`
- Allowed operation: SELECT
- Target roles: `public`
- USING expression: `true`

**Policy 2: Authenticated Upload**
- Policy name: `Authenticated users can upload`
- Allowed operation: INSERT
- Target roles: `authenticated`
- WITH CHECK expression: `true`

## Step 5: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Steps

1. Click **Sign Up** and create an account
2. You'll be redirected to the feed (empty at first)
3. Click **Create Outfit** to post your first outfit
4. Upload a photo, add your measurements, and list clothing pieces
5. Submit and see it appear in the feed!

## Troubleshooting

**"Failed to create outfit"**
- Check that the storage bucket is named exactly `outfits`
- Verify storage policies are set up correctly
- Check browser console for specific errors

**"Invalid login credentials"**
- Make sure you confirmed your email (check spam folder)
- Or disable email confirmation in Supabase: **Authentication** > **Providers** > **Email** > Disable "Confirm email"

**Images not loading**
- Verify the storage bucket is public
- Check that `next.config.ts` has the correct image domain pattern
