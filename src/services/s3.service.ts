import { s3 } from '../config/aws';
import crypto from 'crypto';

export async function uploadImage(buffer: Buffer, key: string, mimetype: string): Promise<string> {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'private',
  };
  const data = await s3.upload(params).promise();
  return data.Location;
}

export function generateS3Key(userId: number, originalName: string): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `users/${userId}/images/${timestamp}.${extension}`;
}

export function generateCloudFrontSignedUrl(s3Key: string, expiresIn: number = 3600): string {
  const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
  const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;
  const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;

  if (!cloudfrontDomain || !keyPairId || !privateKey) {
    throw new Error('CloudFront configuration missing');
  }

  const url = `https://${cloudfrontDomain}/${s3Key}`;
  const expires = Math.floor(Date.now() / 1000) + expiresIn;

  const policy = {
    Statement: [
      {
        Resource: `https://${cloudfrontDomain}/${s3Key}`,
        Condition: {
          DateLessThan: {
            'AWS:EpochTime': expires,
          },
        },
      },
    ],
  };

  const policyString = JSON.stringify(policy);
  const policyBuffer = Buffer.from(policyString, 'utf8');
  const signature = crypto.sign('RSA-SHA1', policyBuffer, privateKey);
  const signatureBase64 = signature.toString('base64');

  const queryParams = new URLSearchParams({
    Policy: policyString,
    Signature: signatureBase64,
    'Key-Pair-Id': keyPairId,
  });

  return `${url}?${queryParams.toString()}`;
}

export function generateS3SignedUrl(s3Key: string, expiresIn: number = 3600): string {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: s3Key,
    Expires: expiresIn,
  };
  
  try {
    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('Error generating S3 signed URL:', error);
    // Final fallback: return direct S3 URL (this will fail for private objects)
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
  }
}

export async function deleteImage(s3Key: string): Promise<void> {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: s3Key,
  };
  await s3.deleteObject(params).promise();
}













