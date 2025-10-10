// middlewares/upload.js
import multer from 'multer';
import path from 'path';

// Configuração do armazenamento local
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Filtro para aceitar apenas arquivos Excel
const fileFilter = (req, file, cb) => {
  const fileTypes = /xlsx|xls/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas arquivos Excel (.xlsx, .xls) são permitidos'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // até 5MB
});

export default upload;
