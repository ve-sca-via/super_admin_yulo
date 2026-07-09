import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const uploadDocuments = (fields, maxSizeMB = 5) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED.includes(file.mimetype)) cb(null, true);
      else cb(new ApiError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, WebP or PDF are allowed'));
    },
  }).fields(fields);
