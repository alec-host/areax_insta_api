const express = require('express');
const multer = require('multer');
const { postPing, getUserProfileInfoAndInsightsWithPrivateApi, postImageWithCaptionPrivateApi, trackHashtagWithPrivateApi } = require('../controllers/post.ig.private.controller');
const { postImageWithCaptionGraphAPI } = require('../controllers/post.ig.graph.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/ping', postPing);
router.post('/private-caption-image', upload.single('image'), postImageWithCaptionPrivateApi);
router.post('/graph-caption-image', upload.single('image'), postImageWithCaptionGraphAPI);
router.post('/private-user-profile-insight', getUserProfileInfoAndInsightsWithPrivateApi);
router.post('/private-hashtag', trackHashtagWithPrivateApi);

module.exports = router;