// utils/s3Utils.js
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

// Initialize S3 client
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Define allowed file types
const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"];

/**
 * Upload a single file to S3
 * @param {Object} file - The file object to upload
 * @param {String} bucketName - S3 bucket name
 * @returns {String} - The S3 URL of the uploaded file
 */
export const uploadFileToS3 = async (file, bucketName) => {
  // Validate file type
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Invalid file type. Allowed types are JPG, PNG, GIF, and MP4.");
  }

  // Create a unique filename
  const fileName = uuidv4() + "-" + file.originalname;

  // Set S3 upload parameters
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read", // Make the file publicly accessible (optional)
  };

  try {
    // Upload to S3
    const s3Response = await s3.upload(params).promise();
    return s3Response.Location; // Return the URL of the uploaded file
  } catch (error) {
    throw new Error(`Error uploading file to S3: ${error.message}`);
  }
};
