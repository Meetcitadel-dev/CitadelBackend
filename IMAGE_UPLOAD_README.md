# S3 Image Upload with CloudFront CDN

This implementation provides secure image upload functionality using AWS S3 and CloudFront CDN with signed URLs for protection.

## Environment Variables Required

Add these environment variables to your `.env` file:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket_name

# CloudFront Configuration
CLOUDFRONT_DOMAIN=your_cloudfront_domain
CLOUDFRONT_KEY_PAIR_ID=your_key_pair_id
CLOUDFRONT_PRIVATE_KEY=your_private_key

# JWT Secret
JWT_SECRET=your_jwt_secret
```

## Database Migration

Run the migration to create the user_images table:

```bash
npx sequelize-cli db:migrate
```

## API Endpoints

### 1. Upload Image
**POST** `/api/profile/upload-image`

Upload an image file. Requires authentication.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Body:**
- `image`: Image file (max 5MB, images only)

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "data": {
    "id": 1,
    "s3Key": "users/1/images/1234567890.jpg",
    "cloudfrontUrl": "https://your-cloudfront-domain.com/users/1/images/1234567890.jpg?Policy=...&Signature=...&Key-Pair-Id=...",
    "originalName": "photo.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 1024000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get User Images
**GET** `/api/profile/images`

Get all images for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Images retrieved successfully",
  "data": [
    {
      "id": 1,
      "userId": 1,
      "s3Key": "users/1/images/1234567890.jpg",
      "cloudfrontUrl": "https://your-cloudfront-domain.com/users/1/images/1234567890.jpg?Policy=...&Signature=...&Key-Pair-Id=...",
      "originalName": "photo.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 1024000,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Delete Image
**DELETE** `/api/profile/images/:imageId`

Delete a specific image. Only the owner can delete their images.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Image deleted successfully"
}
```

### 4. Get Signed URL
**GET** `/api/profile/images/:imageId/signed-url`

Get a new signed URL for an image (useful when URLs expire).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Signed URL generated successfully",
  "data": {
    "signedUrl": "https://your-cloudfront-domain.com/users/1/images/1234567890.jpg?Policy=...&Signature=...&Key-Pair-Id=...",
    "expiresIn": 3600
  }
}
```

## Features

1. **Secure Upload**: Images are uploaded directly to S3 with proper access controls
2. **CloudFront CDN**: Images are served through CloudFront for better performance
3. **Signed URLs**: CloudFront URLs are signed for security and access control
4. **File Validation**: Only image files up to 5MB are allowed
5. **User Isolation**: Users can only access their own images
6. **Database Tracking**: All image metadata is stored in the database
7. **Automatic Cleanup**: When images are deleted, they're removed from both S3 and database

## Security Features

- **Authentication Required**: All endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own images
- **File Type Validation**: Only image files are allowed
- **File Size Limits**: Maximum 5MB per file
- **Signed URLs**: CloudFront URLs are signed and expire after 1 hour
- **S3 Access Control**: Images are stored with proper ACL settings

## Error Handling

The API includes comprehensive error handling for:
- Invalid file types
- File size limits
- Authentication failures
- S3 upload errors
- Database errors
- Missing files

## Usage Example (Frontend)

```javascript
// Upload image
const formData = new FormData();
formData.append('image', file);

const response = await fetch('/api/profile/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(result.data.cloudfrontUrl); // Use this URL to display the image
```

## CloudFront Setup

1. Create a CloudFront distribution pointing to your S3 bucket
2. Configure the distribution to use signed URLs
3. Create a key pair in AWS IAM for CloudFront
4. Update your environment variables with the CloudFront domain and key pair details

## S3 Bucket Setup

1. Create an S3 bucket with appropriate permissions
2. Configure CORS if needed for direct uploads
3. Set up bucket policies for CloudFront access
4. Ensure your AWS credentials have proper S3 permissions 