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
            reject(error);
            return;
          }

          if (!result) {
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
  const signedUrl = cloudinary.url(publicId, {
    resource_type: "raw",
    type: "authenticated",
    sign_url: true,
    secure: true,
  });

  return fetch(signedUrl);
};

module.exports = {
  uploadToCloudinary,
  downloadFromCloudinary,
};