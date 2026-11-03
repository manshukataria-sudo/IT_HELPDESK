const crypto = require("crypto");
const path = require("path");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (file) => {
  try {
    return await new Promise((resolve, reject) => {
      const fileExtension = path.extname(file.originalname);
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: `${crypto.randomUUID()}${fileExtension}`,
          resource_type: "raw",
          type: "authenticated",
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(new Error(error.message || "Cloudinary upload failed"));
            return;
          }

          if (!result?.public_id) {
            reject(new Error("Cloudinary upload returned no asset"));
            return;
          }

          resolve({
            blobName: result.public_id,
            fileName: file.originalname,
            contentType: file.mimetype,
            size: file.size,
          });
        }
      );

      uploadStream.end(file.buffer);
    });
  } finally {
    file.buffer = null;
  }
};

const downloadFromCloudinary = async (publicId) => {
  const format = path.extname(publicId).slice(1);
  const signedUrl = cloudinary.utils.private_download_url(publicId, format, {
    resource_type: "raw",
    type: "authenticated",
    attachment: true,
    expires_at: Math.floor(Date.now() / 1000) + 300,
  });

  return fetch(signedUrl);
};

module.exports = {
  uploadToCloudinary,
  downloadFromCloudinary,
};