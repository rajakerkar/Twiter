const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload image to Cloudinary
const uploadImage = async (imageString) => {
  try {
    if (!imageString) return null;

    // Log Cloudinary configuration for debugging
    console.log('Cloudinary Config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
    });

    // Handle both URLs and base64 strings
    if (imageString.startsWith('http')) {
      return imageString; // Already a URL, no need to upload
    }

    // Upload the image
    const uploadResponse = await cloudinary.uploader.upload(imageString, {
      folder: 'twitter_clone',
      resource_type: 'auto'
    });

    console.log('Cloudinary Upload Response:', uploadResponse);

    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImage
};
