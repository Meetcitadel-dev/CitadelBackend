import { s3 } from '../config/aws';

export async function uploadImage(buffer: Buffer, key: string, mimetype: string): Promise<string> {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET as string,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'public-read',
  };
  const data = await s3.upload(params).promise();
  return data.Location;
}












