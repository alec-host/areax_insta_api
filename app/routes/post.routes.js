const express = require('express');
const multer = require('multer');
const { postCaptionWithImage } = require('../controllers/post.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/caption-image', upload.single('image'), postCaptionWithImage);

module.exports = router;
