import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Ensure environment variables are set
// console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
// console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET);

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.error("Local file path is not provided");
            return null;
        }

        // Check if the file exists
        if (!fs.existsSync(localFilePath)) {
            console.error("File does not exist at:", localFilePath);
            return null;
        }

        // Upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // File has been uploaded successfully
        console.log("File uploaded to Cloudinary:", response.url);

        // Remove the locally saved temporary file
        fs.unlink(localFilePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            } else {
                console.log("File deleted successfully:", localFilePath);
            }
        });

        return response;

    } catch (error) {
        // Log the error
        console.error("Error uploading file to Cloudinary:", error.message);
        return null;
    }
};

export { uploadOnCloudinary };
