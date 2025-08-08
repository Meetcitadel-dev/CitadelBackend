# CloudFront CORS Setup Guide

## Current Issue
CloudFront is blocking requests from `http://localhost:5173` due to missing CORS headers.

## Temporary Fix (Applied)
✅ Modified backend to use S3 signed URLs instead of CloudFront URLs
✅ This bypasses the CORS issue temporarily

## Permanent Solution: CloudFront Function

### Step 1: Access CloudFront Console
1. Go to: https://console.aws.amazon.com/cloudfront/
2. Find your distribution: `d30b6xyuschsqw.cloudfront.net`
3. Click on the distribution ID

### Step 2: Create CloudFront Function
1. Go to "Functions" tab
2. Click "Create function"
3. Fill in:
   - **Function name**: `cors-headers`
   - **Function type**: `Viewer response`
   - **Description**: `Add CORS headers to image responses`

### Step 3: Add Function Code
Paste this code in the function editor:

```javascript
function handler(event) {
    var response = event.response;
    var headers = response.headers;
    
    // Add CORS headers
    headers['access-control-allow-origin'] = {value: 'http://localhost:5173'};
    headers['access-control-allow-methods'] = {value: 'GET, HEAD'};
    headers['access-control-allow-headers'] = {value: '*'};
    headers['access-control-max-age'] = {value: '3000'};
    
    return response;
}
```

### Step 4: Deploy Function
1. Click "Save changes"
2. Click "Deploy"
3. Wait for deployment to complete

### Step 5: Associate Function with Behavior
1. Go to "Behaviors" tab
2. Find the behavior that handles your images (usually `/*` or `/users/*`)
3. Click "Edit"
4. Scroll down to "Function associations"
5. Under "Viewer response", select your function: `cors-headers`
6. Click "Save changes"

### Step 6: Test the Fix
1. Wait 5-10 minutes for changes to propagate
2. Refresh your frontend
3. Check browser console - CORS errors should be gone

## Alternative: Response Headers Policy

If CloudFront Functions don't work, try Response Headers Policy:

### Step 1: Create Response Headers Policy
1. Go to CloudFront Console
2. Click "Policies" in left sidebar
3. Click "Response headers policies"
4. Click "Create response headers policy"
5. Name: `cors-policy`

### Step 2: Configure Headers
Add these headers:
- **Access-Control-Allow-Origin**: `http://localhost:5173`
- **Access-Control-Allow-Methods**: `GET, HEAD`
- **Access-Control-Allow-Headers**: `*`
- **Access-Control-Max-Age**: `3000`

### Step 3: Associate with Behavior
1. Go to "Behaviors" tab
2. Edit the behavior
3. Under "Response headers policy", select your policy
4. Save changes

## Verification

After applying either solution, test with:

```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     "https://d30b6xyuschsqw.cloudfront.net/users/38/images/test.png"
```

You should see CORS headers in the response.

## Revert Temporary Fix

Once CloudFront CORS is working, revert the S3 service:

```typescript
// In backend/src/services/s3.service.ts
// Remove the temporary fix and restore original CloudFront code
```

## Success Indicators

✅ No CORS errors in browser console
✅ Images load properly in frontend
✅ Network tab shows successful requests
✅ No more `403 Forbidden` errors 