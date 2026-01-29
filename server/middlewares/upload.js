import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directory exists
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    if (req.route?.path?.includes("/upload/:projectId")) {
      uploadPath = path.join(
        __dirname,
        "../uploads/projects",
        req.params.projectId
      );
    } else if (req.route?.path?.includes("/upload/:userId")) {
      uploadPath = path.join(
        __dirname,
        "../uploads/users",
        req.params.userId
      );
    } else {
      uploadPath = path.join(__dirname, "../uploads/temp");
    }

    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/gif",
  ];

  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".jpeg",
    ".jpg",
    ".png",
    ".gif",
  ];

  const fileExt = path.extname(file.originalname).toLowerCase();

  if (
    allowedTypes.includes(file.mimetype) &&
    allowedExtensions.includes(fileExt)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, Word documents, and images are allowed."
      ),
      false
    );
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10,
  },
});

// Error handler middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File too large. Max size is 10MB",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files. Max 10 files allowed",
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  next(err);
};

// export {upload,handleUploadError};
