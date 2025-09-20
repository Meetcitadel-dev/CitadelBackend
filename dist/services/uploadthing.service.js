"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utUploadImageFromBuffer = utUploadImageFromBuffer;
exports.utDeleteImageByKey = utDeleteImageByKey;
const server_1 = require("uploadthing/server");
const utapi = new server_1.UTApi();
async function utUploadImageFromBuffer(buffer, fileName, mimeType) {
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
async function utDeleteImageByKey(key) {
    await utapi.deleteFiles(key);
}
