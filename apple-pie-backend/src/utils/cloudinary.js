const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const subirACloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const ext = originalname.split('.').pop().toLowerCase();
    const rawTypes = ['docx', 'pptx', 'xlsx', 'txt'];
    const resource_type = rawTypes.includes(ext) ? 'raw' : 'auto';

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'apple-pie/recursos', resource_type },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { cloudinary, upload, subirACloudinary };
