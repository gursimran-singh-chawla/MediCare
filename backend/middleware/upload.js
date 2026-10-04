const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Vercel functions can only write to /tmp. Files there are ephemeral, so use
// object storage before relying on uploads in a production deployment.
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'medicare-uploads')
  : path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ storage });

module.exports = upload;
module.exports.uploadDir = uploadDir;
