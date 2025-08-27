import * as territoryService from "../services/territory.service.js";
import upload from "../utils/multer.js";
import { uploadFileToS3 } from "../utils/s3Utils.js";

import fs from "fs";


// Get all
export const getAll = async (req, res) => {
  try {
    const territories = await territoryService.getAll();
    res.json({ success: true, data: territories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch territories",
      error: error.message,
    });
  }
};

// Get by ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const territory = await territoryService.getById(id);
    if (!territory) {
      return res
        .status(404)
        .json({ success: false, message: "Territory not found" });
    }
    res.json({ success: true, data: territory });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch territory",
      error: error.message,
    });
  }
};

// Create
export const create = [
  upload.fields([
    { name: "locationImages", maxCount: 10 },
    { name: "pincodeImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const data = req.body;

      console.log(req.files,"req.filesreq.filesreq.filesreq.files");
      
      // multer files
      const locationFiles = req.files.locationImages || [];
      const pincodeFiles = req.files.pincodeImages || [];

      // Parse JSON fields if sent as strings (common in multipart requests)
      if (typeof data.locations === "string") {
        data.locations = JSON.parse(data.locations);
      }
      if (typeof data.pincodes === "string") {
        data.pincodes = JSON.parse(data.pincodes);
      }

      // Upload each location image to S3 and attach URL
      if (data.locations && locationFiles.length) {
        for (let i = 0; i < data.locations.length; i++) {
          if (locationFiles[i]) {
            const file = locationFiles[i];
            const fileBuffer = fs.readFileSync(file.path);
            const s3Url = await uploadFileToS3(
              {
                buffer: fileBuffer,
                originalname: file.originalname,
                mimetype: file.mimetype,
              },
              process.env.S3_BUCKET_NAME
            );
            data.locations[i].imageUrl = s3Url;
            fs.unlinkSync(file.path); // clean local file after upload
          }
        }
      }

      // Upload each pincode image to S3 and attach URL
      if (data.pincodes && pincodeFiles.length) {
        for (let i = 0; i < data.pincodes.length; i++) {
          if (pincodeFiles[i]) {
            const file = pincodeFiles[i];
            const fileBuffer = fs.readFileSync(file.path);
            const s3Url = await uploadFileToS3(
              {
                buffer: fileBuffer,
                originalname: file.originalname,
                mimetype: file.mimetype,
              },
              process.env.S3_BUCKET_NAME
            );
            data.pincodes[i].imageUrl = s3Url;
            fs.unlinkSync(file.path); // clean local file after upload
          }
        }
      }

      // Now create territory records with image URLs
      const newTerritory = await territoryService.create(data);

      res.status(201).json({ success: true, data: newTerritory });
    } catch (error) {
      const status = /already exists|validation/i.test(error.message)
        ? 400
        : 500;
      res.status(status).json({
        success: false,
        message: "Failed to create territory",
        error: error.message,
      });
    }
  },
];

// Update
export const update = async (req, res) => {
  try {
    const updated = await territoryService.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    const status = /not found|validation/i.test(error.message) ? 400 : 500;
    res.status(status).json({
      success: false,
      message: "Failed to update territory",
      error: error.message,
    });
  }
};

// Delete
export const removeTerritory = async (req, res) => {
  try {
    await territoryService.remove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    const status = /assigned/i.test(error.message) ? 409 : 500;
    res.status(status).json({
      success: false,
      message: "Failed to delete territory",
      error: error.message,
    });
  }
};
