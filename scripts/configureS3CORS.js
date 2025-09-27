const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const s3 = new AWS.S3();

async function configureS3CORS() {
  try {
    const bucketName = process.env.AWS_S3_BUCKET;
    
    if (!bucketName) {
      console.error('❌ AWS_S3_BUCKET environment variable is not set');
      return;
    }

    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'HEAD'],
          AllowedOrigins: process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
            : [
                'http://localhost:5173',  // Development
                'http://localhost:3000',  // Alternative dev port
                '*'  // For development - remove in production
              ],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000
        }
      ]
    };

    const params = {
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration
    };

    console.log('🔄 Configuring CORS for S3 bucket:', bucketName);
    console.log('📋 CORS Configuration:', JSON.stringify(corsConfiguration, null, 2));

    await s3.putBucketCors(params).promise();
    
    console.log('✅ CORS configuration applied successfully!');
    console.log('🎯 Your frontend should now be able to access images from CloudFront');
    
  } catch (error) {
    console.error('❌ Error configuring CORS:', error);
    
    if (error.code === 'NoSuchBucket') {
      console.error('💡 Make sure your S3 bucket exists and AWS_S3_BUCKET is correct');
    } else if (error.code === 'AccessDenied') {
      console.error('💡 Make sure your AWS credentials have S3 permissions');
    }
  }
}

// Run the configuration
configureS3CORS(); 