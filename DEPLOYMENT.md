# Railway Deployment Guide

## Environment Variables Required

Set these environment variables in your Railway dashboard:

### Database
- `MONGODB_URI`: Your MongoDB connection string
- `DATABASE_URL`: Same as MONGODB_URI (for Prisma compatibility)

### Authentication
- `NEXTAUTH_URL`: Your Railway app URL (e.g., https://your-app.railway.app)
- `NEXTAUTH_SECRET`: Generate with: `openssl rand -base64 32`
- `CSRF_SECRET`: Generate with: `openssl rand -base64 32`

### Environment
- `NODE_ENV`: Set to `production`

### API Keys
- `GEMINI_API_KEY`: Your Google Gemini API key

## Deployment Steps

1. **Set Environment Variables**: Add all variables listed above in Railway dashboard
2. **Deploy**: Push your code or trigger a redeploy
3. **Verify**: Check that the app loads without 500/505 errors

## Common Issues Fixed

- ✅ SSR hydration issues with localStorage and window access
- ✅ Theme context properly handles client-side only operations
- ✅ Background nodes component waits for mount before accessing window
- ✅ Next.js config uses standalone output for better Railway compatibility
- ✅ Railway config uses standard npm start command
- ✅ Prisma generation included in build process

## Troubleshooting

If you still get 500/505 errors:
1. Check Railway logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure NEXTAUTH_URL matches your actual Railway domain
4. Regenerate NEXTAUTH_SECRET and CSRF_SECRET if needed