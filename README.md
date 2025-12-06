# Outfit Share

A social platform where users can share outfit ideas with detailed sizing information to help others recreate their looks.

## Features

- User authentication with Supabase
- Create outfit posts with photos
- Add clothing piece details (brand, product name, size)
- Include publisher height and size
- Browse outfit feed
- Like outfits
- Follow system (database ready)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Create Database Tables

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the query to create all tables and policies

### 4. Set Up Storage

1. In Supabase dashboard, go to Storage
2. Create a new bucket called `outfits`
3. Make it public:
   - Click on the bucket
   - Go to Policies
   - Add policy: "Public Access" for SELECT operations
   - Add policy: "Authenticated users can upload" for INSERT operations

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Sign up for an account
2. Create your first outfit post with:
   - Upload a photo
   - Add your height and size
   - List each clothing piece with brand, product name, and size
3. Browse the feed to see other users' outfits
4. Like outfits you love

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database + Storage)
- React

## Project Structure

```
outfit-share/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home/auth page
│   ├── feed/              # Outfit feed
│   ├── create/            # Create outfit page
│   └── auth/              # Auth routes
├── components/            # React components
│   ├── AuthForm.tsx       # Sign in/up form
│   ├── CreateOutfit.tsx   # Outfit creation form
│   └── OutfitCard.tsx     # Outfit display card
├── lib/                   # Utilities
│   └── supabase.ts        # Supabase client
├── types/                 # TypeScript types
│   └── index.ts
└── supabase/             # Database schema
    └── schema.sql
```

## Database Schema

- `profiles` - User profiles
- `outfits` - Outfit posts
- `clothing_pieces` - Individual clothing items per outfit
- `follows` - User follow relationships
- `likes` - Outfit likes

All tables have Row Level Security enabled for data protection.
