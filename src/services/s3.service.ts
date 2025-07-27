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

  // If CloudFront is not configured, return S3 URL directly
  if (!cloudfrontDomain || !keyPairId || !privateKey) {
    console.warn('CloudFront not configured, using S3 URL directly');
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
  }

  // Format the private key properly for Node.js crypto
  let formattedPrivateKey = privateKey;
  if (!privateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    // If the key doesn't have PEM headers, add them
    formattedPrivateKey = `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`;
  }

  const url = `https://${cloudfrontDomain}/${s3Key}`;
  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  
  const policy = {
    Statement: [
      {
        Resource: url,
        Condition: {
          DateLessThan: {
            'AWS:EpochTime': expires
          }
        }
      }
    ]
  };

  const policyString = JSON.stringify(policy);
  const policyBuffer = Buffer.from(policyString, 'utf8');
  const policyBase64 = policyBuffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  try {
    const sign = crypto.createSign('RSA-SHA1');
    sign.update(policyString);
    const signature = sign.sign(formattedPrivateKey, 'base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    return `${url}?Policy=${policyBase64}&Signature=${signature}&Key-Pair-Id=${keyPairId}`;
  } catch (error) {
    console.error('Error generating CloudFront signed URL:', error);
    // Fallback: return the S3 URL without CloudFront signing
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













