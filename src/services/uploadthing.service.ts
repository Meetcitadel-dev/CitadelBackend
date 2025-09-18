import { UTApi } from 'uploadthing/server';

export interface UploadThingUploadResult {
  url: string;
  key: string;
  name?: string;
  size?: number;
  type?: string;
}

const utapi = new UTApi();

export async function utUploadImageFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadThingUploadResult> {
  // Convert Buffer to Blob for UTApi compatibility (Node 18+)
  const blob = new Blob([buffer], { type: mimeType });
  const file = new File([blob], fileName, { type: mimeType });

  const result = await utapi.uploadFiles(file);

  if (!result || !result.data) {
    throw new Error('UploadThing upload failed');
  }

  return {
    url: result.data.url,
    key: result.data.key,
    name: result.data.name,
    size: result.data.size,
    type: result.data.type,
  };
}

export async function utDeleteImageByKey(key: string): Promise<void> {
  await utapi.deleteFiles(key);
}


