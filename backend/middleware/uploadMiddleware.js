import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary from .env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    // This folder will be created in your Cloudinary account
    folder: 'submissions', 
    
    // This is the unsigned preset name you created (e.g., 'unsigned_sarv')
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    
    // Let Cloudinary automatically detect the file type
    resource_type: 'auto', 
  },
});

// Initialize Multer with the new Cloudinary storage
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 30 }, // 10MB file size limit
});

export default upload;