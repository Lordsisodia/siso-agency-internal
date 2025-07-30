# SISO Core - Task Management & Life Log Tracker

A comprehensive task management platform with AI assistance and life logging capabilities.

## Features

- Task Management with AI integration
- Life Log Tracker
- Multi-user support
- Real-time updates
- Responsive design

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone the repository

```bash
git clone [your-repo-url]
cd SISO-CORE
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run locally

```bash
npm run dev
```

## Deployment to Vercel

### 1. Push to GitHub

Make sure your code is pushed to a GitHub repository.

### 2. Import to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 3. Deploy

Click "Deploy" and Vercel will build and deploy your application.

## Troubleshooting

### Authentication Errors

If you're getting authentication errors after deployment:

1. **Check Environment Variables**: Make sure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly in Vercel
2. **Verify Supabase URL**: Ensure the URL doesn't have trailing slashes
3. **Check API Keys**: Make sure you're using the anon/public key, not the service role key
4. **CORS Settings**: In Supabase dashboard, check that your Vercel domain is allowed in the URL configuration

### Build Errors

If the build fails:

1. Check the build logs in Vercel
2. Make sure all dependencies are listed in `package.json`
3. Verify Node.js version compatibility

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Security Notes

- Never commit `.env` files to version control
- Always use environment variables for sensitive data
- Keep your Supabase keys secure
- Use Row Level Security (RLS) in Supabase