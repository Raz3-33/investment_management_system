import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import sanitizedConfig from "../config.js";

export const uploadToCloudflare = async (filePath, originalName) => {
  try {
    const formData = new FormData();
    const fileStream = fs.createReadStream(filePath);

    formData.append("file", fileStream, originalName);

    const res = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${sanitizedConfig.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${sanitizedConfig.CLOUDFLARE_API_TOKEN}`,
          ...formData.getHeaders(),
        },
      }
    );

    // Delete the file after uploading
    fs.unlink(filePath, (err) => {
      if (err) console.warn("⚠️ Failed to delete local file:", filePath);
      else console.log("🗑️ Deleted local file:", filePath);
    });

    return res.data;
  } catch (error) {
    console.error(
      "Cloudflare upload error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to upload image to Cloudflare");
  }
};