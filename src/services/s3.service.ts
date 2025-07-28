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

  // Validate CloudFront configuration
  const hasValidCloudFront = cloudfrontDomain && 
                            keyPairId && 
                            privateKey && 
                            privateKey.length > 1000 && // Valid RSA key should be much longer
                            privateKey.includes('-----BEGIN') && 
                            privateKey.includes('-----END');

  // If CloudFront is not properly configured, use S3 signed URL
  if (!hasValidCloudFront) {
    console.warn('CloudFront not properly configured, using S3 signed URL');
    console.warn('CloudFront issues:', {
      domain: !cloudfrontDomain,
      keyPairId: !keyPairId,
      privateKey: !privateKey,
      keyTooShort: privateKey && privateKey.length <= 1000,
      missingHeaders: privateKey && (!privateKey.includes('-----BEGIN') || !privateKey.includes('-----END'))
    });
    return generateS3SignedUrl(s3Key, expiresIn);
  }

  // Format the private key properly for Node.js crypto
  let formattedPrivateKey = privateKey.trim();
  
  // Check if it's already in PEM format
  if (!formattedPrivateKey.includes('-----BEGIN')) {
    // If the key doesn't have PEM headers, add them
    // Split the key into 64-character lines
    const keyLines = [];
    for (let i = 0; i < formattedPrivateKey.length; i += 64) {
      keyLines.push(formattedPrivateKey.substring(i, i + 64));
    }
    
    formattedPrivateKey = `-----BEGIN RSA PRIVATE KEY-----\n${keyLines.join('\n')}\n-----END RSA PRIVATE KEY-----`;
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
    
    console.log('✅ Generating CloudFront signed URL');
    return `${url}?Policy=${policyBase64}&Signature=${signature}&Key-Pair-Id=${keyPairId}`;
  } catch (error) {
    console.error('Error generating CloudFront signed URL:', error);
    console.error('Private key format check:', {
      hasHeaders: formattedPrivateKey.includes('-----BEGIN'),
      hasFooters: formattedPrivateKey.includes('-----END'),
      keyLength: formattedPrivateKey.length,
      firstLine: formattedPrivateKey.split('\n')[0],
      lastLine: formattedPrivateKey.split('\n').slice(-1)[0]
    });
    // Fallback: generate S3 signed URL
    return generateS3SignedUrl(s3Key, expiresIn);
  }
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













