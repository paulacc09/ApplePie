const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const subirACloudinary = (buffer, arg) => {
  return new Promise((resolve, reject) => {
    if (buffer == null) {
      reject(new Error('buffer requerido'));
      return;
    }

    let options;
    let returnSecureUrlOnly = false;

    if (arg != null && typeof arg === 'object') {
      options = { ...arg };
      returnSecureUrlOnly = true;
    } else {
      const originalname = arg || '';
      const ext = String(originalname).split('.').pop().toLowerCase();
      const rawTypes = ['docx', 'pptx', 'xlsx', 'txt'];
      const resource_type = rawTypes.includes(ext) ? 'raw' : 'auto';
      options = { folder: 'apple-pie/recursos', resource_type };
    }

    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else if (returnSecureUrlOnly) resolve(result.secure_url);
      else resolve(result);
    });
    stream.end(buffer);
  });
};
module.exports = { cloudinary, upload, subirACloudinary };
