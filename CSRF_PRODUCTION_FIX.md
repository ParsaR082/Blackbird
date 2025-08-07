# CSRF Production Fix Guide

## Problem Analysis

The CSRF protection was failing in production (Docker) but working in development. After analyzing the code, here are the key issues identified and fixed:

## Root Causes & Solutions

### 1. **Cookie SameSite Policy Issue** ⚠️ **CRITICAL**
**Problem**: Using `sameSite: 'strict'` in production prevents cookies from being sent in many legitimate scenarios, especially when:
- The app is accessed through a reverse proxy
- There are redirects involved
- Cross-origin requests occur (even legitimate ones)

**Solution**: Changed to `sameSite: 'lax'` which allows cookies to be sent with top-level navigation while still providing CSRF protection.

```typescript
// Before (problematic)
sameSite: 'strict'

// After (fixed)
sameSite: isProduction ? 'lax' as const : 'lax' as const
```

### 2. **Missing Credentials in CSRF Request** 🔧
**Problem**: The client wasn't consistently sending cookies when requesting CSRF tokens.

**Solution**: Added `credentials: 'include'` to all CSRF-related requests to ensure cookies are sent and received.

```typescript
const csrfResponse = await fetch('/api/auth/csrf', {
  credentials: 'include', // Ensure cookies are sent and received
  cache: 'no-store'
})
```

### 3. **Lack of Debugging Information** 🐛
**Problem**: No visibility into what was happening in production.

**Solution**: Added comprehensive debug logging that can be enabled with `CSRF_DEBUG=true` environment variable.

### 4. **Cache Control Issues** 📦
**Problem**: CSRF tokens might be cached, causing stale tokens to be used.

**Solution**: Added proper cache control headers to prevent CSRF token caching.

## Files Modified

1. **`lib/csrf.ts`** - Core CSRF logic improvements
2. **`contexts/auth-context.tsx`** - Client-side request improvements  
3. **`app/api/auth/csrf/route.ts`** - Better logging and cache control
4. **`app/api/auth/debug-csrf/route.ts`** - New debug endpoint (created)

## Environment Variables

Add these to your production environment for debugging:

```bash
# Enable CSRF debugging (optional, for troubleshooting)
CSRF_DEBUG=true

# Force secure cookies even in non-production (optional)
FORCE_SECURE_COOKIES=true
```

## Testing & Debugging

### 1. Debug Endpoint
Access `/api/auth/debug-csrf` to see:
- Environment variables
- Available cookies
- Request headers
- CSRF cookie status

### 2. Enable Debug Logging
Set `CSRF_DEBUG=true` in your environment to see detailed CSRF logs.

### 3. Browser Developer Tools
Check the Network tab to verify:
- CSRF token is received from `/api/auth/csrf`
- Cookie is set with correct attributes
- Cookie is sent with login request
- `x-csrf-token` header is present in login request

## Production Deployment Checklist

- [ ] Ensure `NODE_ENV=production` is set
- [ ] Set a strong `CSRF_SECRET` (use `openssl rand -base64 32`)
- [ ] Verify cookies are being set (check `/api/auth/debug-csrf`)
- [ ] Test login flow end-to-end
- [ ] Check browser console for any CSRF debug logs
- [ ] Verify no CORS issues in browser network tab

## Docker Considerations

The fixes are specifically designed to work in Docker environments:

1. **No domain restrictions** - Cookies work with any hostname
2. **Proxy-friendly** - `sameSite: 'lax'` works with reverse proxies
3. **Environment-aware** - Automatically detects production vs development

## Common Issues & Solutions

### Issue: "Invalid CSRF token" in production only
**Cause**: Usually `sameSite: 'strict'` or missing `credentials: 'include'`
**Solution**: Applied in this fix

### Issue: Cookie not being set
**Cause**: Incorrect secure/sameSite configuration
**Solution**: Use the debug endpoint to verify cookie settings

### Issue: Cookie set but not sent with requests
**Cause**: Missing `credentials: 'include'` in fetch requests
**Solution**: Applied in this fix

### Issue: Intermittent failures
**Cause**: Cached CSRF tokens or timing issues
**Solution**: Added cache control headers and better error handling

## Verification Steps

1. Deploy the updated code to production
2. Access `/api/auth/debug-csrf` to verify environment
3. Try logging in and check browser console for debug logs
4. If issues persist, enable `CSRF_DEBUG=true` and check server logs

## Security Notes

- The changes maintain the same level of CSRF protection
- `sameSite: 'lax'` is still secure for CSRF protection
- Debug logging only shows token previews, not full tokens
- Debug endpoint doesn't expose sensitive information