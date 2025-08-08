# CORS Fix Guide for CloudFront Images

## Problem
Your frontend running on `http://localhost:5173` cannot load images from CloudFront because of CORS policy blocking. The error shows:
- `403 (Forbidden)` from CloudFront
- `No 'Access-Control-Allow-Origin' header is present`

## Root Cause
CloudFront is serving images directly to the browser, but doesn't have CORS headers configured. The browser blocks these requests due to same-origin policy.

## Solution Steps

### Step 1: Configure S3 Bucket CORS (Primary Fix)

Run the CORS configuration script:

```bash
cd backend
node scripts/configureS3CORS.js
```

This script will:
- Configure your S3 bucket to allow CORS requests
- Allow requests from `http://localhost:5173`
- Set proper headers for image access

### Step 2: Verify S3 CORS Configuration

Check if CORS is properly configured:

```bash
aws s3api get-bucket-cors --bucket YOUR_BUCKET_NAME
```

You should see output like:
```json
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": ["http://localhost:5173", "*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
```

### Step 3: CloudFront Cache Invalidation (Important!)

After configuring S3 CORS, you need to invalidate CloudFront cache:

```bash
# Get your CloudFront distribution ID from AWS Console
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

Or manually:
1. Go to AWS CloudFront Console
2. Select your distribution
3. Go to "Invalidations" tab
4. Create invalidation with path `/*`

### Step 4: Alternative - CloudFront Function (Optional)

If S3 CORS alone doesn't work, deploy a CloudFront function:

1. Go to AWS CloudFront Console
2. Select your distribution
3. Go to "Functions" tab
4. Create new function with this code:

```javascript
function handler(event) {
    var response = event.response;
    var headers = response.headers;
    
    headers['access-control-allow-origin'] = {value: 'http://localhost:5173'};
    headers['access-control-allow-methods'] = {value: 'GET, HEAD'};
    headers['access-control-allow-headers'] = {value: '*'};
    headers['access-control-max-age'] = {value: '3000'};
    
    return response;
}
```

5. Deploy the function
6. Go to "Behaviors" tab
7. Edit the behavior for your image path
8. Add function to "Viewer response"
9. Save changes

### Step 5: Test the Fix

1. Restart your backend server
2. Clear browser cache
3. Refresh your frontend
4. Check browser console - CORS errors should be gone

## Environment Variables Check

Make sure these are set in your `.env`:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket_name
CLOUDFRONT_DOMAIN=your_cloudfront_domain
```

## Troubleshooting

### If images still don't load:

1. **Check CloudFront distribution settings:**
   - Ensure "Viewer Protocol Policy" is set to "Redirect HTTP to HTTPS"
   - Check "Origin Protocol Policy" is set to "HTTPS Only"

2. **Verify S3 bucket policy:**
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Sid": "CloudFrontAccess",
               "Effect": "Allow",
               "Principal": {
                   "Service": "cloudfront.amazonaws.com"
               },
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*",
               "Condition": {
                   "StringEquals": {
                       "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
                   }
               }
           }
       ]
   }
   ```

3. **Test direct S3 access:**
   - Try accessing an image directly via S3 URL
   - If S3 works but CloudFront doesn't, it's a CloudFront configuration issue

### Common Issues:

1. **Cache not invalidated:** CloudFront caches responses for hours
2. **Wrong origin:** Make sure `http://localhost:5173` is in allowed origins
3. **HTTPS/HTTP mismatch:** Ensure both frontend and CloudFront use same protocol
4. **Missing AWS permissions:** Ensure your AWS credentials have S3 and CloudFront permissions

## Production Considerations

For production, replace `http://localhost:5173` with your actual domain:

```json
"AllowedOrigins": [
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

Remove the `"*"` wildcard for security.

## Quick Test

After applying the fix, test with this curl command:

```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     "https://your-cloudfront-domain.com/users/38/images/test.png"
```

You should see CORS headers in the response.

## Success Indicators

✅ Images load without CORS errors in browser console
✅ No more `403 Forbidden` errors
✅ Images display properly in your frontend
✅ Network tab shows successful image requests 