"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
exports.generateS3Key = generateS3Key;
exports.generateCloudFrontSignedUrl = generateCloudFrontSignedUrl;
exports.generateS3SignedUrl = generateS3SignedUrl;
exports.deleteImage = deleteImage;
const aws_1 = require("../config/aws");
const crypto_1 = __importDefault(require("crypto"));
async function uploadImage(buffer, key, mimetype) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'private',
    };
    const data = await aws_1.s3.upload(params).promise();
    return data.Location;
}
function generateS3Key(userId, originalName) {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop();
    return `users/${userId}/images/${timestamp}.${extension}`;
}
function generateCloudFrontSignedUrl(s3Key, expiresIn = 3600) {
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
    const signature = crypto_1.default.sign('RSA-SHA1', policyBuffer, privateKey);
    const signatureBase64 = signature.toString('base64');
    const queryParams = new URLSearchParams({
        Policy: policyString,
        Signature: signatureBase64,
        'Key-Pair-Id': keyPairId,
    });
    return `${url}?${queryParams.toString()}`;
}
function generateS3SignedUrl(s3Key, expiresIn = 3600) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Expires: expiresIn,
    };
    try {
        return aws_1.s3.getSignedUrl('getObject', params);
    }
    catch (error) {
        console.error('Error generating S3 signed URL:', error);
        // Final fallback: return direct S3 URL (this will fail for private objects)
        return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
    }
}
async function deleteImage(s3Key) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
    };
    await aws_1.s3.deleteObject(params).promise();
}
