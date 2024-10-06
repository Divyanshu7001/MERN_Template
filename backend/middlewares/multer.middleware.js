import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname manually in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (_, file, cb) {
    cb(null, path.join(__dirname, "../public/tmp"));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

export const upload = multer({
  storage,
});
