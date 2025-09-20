// utils/s3Utils.js
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import sanitizedConfig from "../config.js";

const s3 = new AWS.S3({
  accessKeyId: sanitizedConfig.AWS_ACCESS_KEY_ID,
  secretAccessKey: sanitizedConfig.AWS_SECRET_ACCESS_KEY,
  region: sanitizedConfig.AWS_REGION,
});

// ✅ Add PDF (and common image/video types you use)
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "application/pdf",
];

export const uploadFileToS3 = async (file, bucketName) => {
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(
      "Invalid file type. Allowed types: JPG, PNG, GIF, WEBP, MP4, PDF."
    );
  }
  const fileName = uuidv4() + "-" + file.originalname;
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  const s3Response = await s3.upload(params).promise();
  return s3Response.Location;
};

// 🔽 NEW: extract S3 key from public URL (works for standard S3 URL formats)
export const getKeyFromS3Url = (url) => {
  try {
    const u = new URL(url);
    // /bucket/key or just /key — handle both
    // If your URL is like https://<bucket>.s3.<region>.amazonaws.com/<key>
    // pathname starts with "/<key>"
    return decodeURIComponent(u.pathname.replace(/^\/+/, ""));
  } catch {
    return null;
  }
};

// 🔽 NEW: delete by URL
export const deleteFileFromS3ByUrl = async (fileUrl) => {
  if (!fileUrl) return;
  const Key = getKeyFromS3Url(fileUrl);
  if (!Key) return;
  const params = { Bucket: sanitizedConfig.S3_BUCKET_NAME, Key };
  await s3.deleteObject(params).promise();
};
