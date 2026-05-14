const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const rawTypes = ['docx', 'pptx', 'xlsx', 'txt'];
    return {
      folder: 'apple-pie/recursos',
      allowed_formats: ['pdf', 'docx', 'pptx', 'xlsx', 'txt', 'png', 'jpg', 'jpeg'],
      resource_type: rawTypes.includes(ext) ? 'raw' : 'auto',
    };
  },
});

const upload = multer({ storage });

module.exports = {
  cloudinary,
  upload,
};
