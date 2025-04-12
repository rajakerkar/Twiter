const cloudinary = require('cloudinary').v2;

// Configure Cloudinary directly with the provided credentials
cloudinary.config({
  cloud_name: 'dtyn5clgu',
  api_key: '379998773423654',
  api_secret: 'U0EOkG-z8fiOLWyd5mHwaDQ_nR8'
});

// Function to upload image to Cloudinary
const uploadImage = async (imageString) => {
  try {
    if (!imageString) return null;
    
    console.log('Cloudinary Config:', {
      cloud_name: 'dtyn5clgu',
      api_key: '379998773423654 (Set)',
      api_secret: 'Set'
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
