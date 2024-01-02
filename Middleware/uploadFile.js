const multer = require('multer');

// Create storage for file upload
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// Create multer instance with the defined storage
const upload = multer({ storage: storage }).single('testImage');

module.exports = upload;
