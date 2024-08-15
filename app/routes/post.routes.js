const express = require('express');
const multer = require('multer');
const { postPing, getUserProfileInfoAndInsightsWithPrivateApi, postImageWithCaptionPrivateApi, postImageUrlWithCaptionPrivateApi, trackHashtagWithPrivateApi } = require('../controllers/post.ig.private.controller');
const { postImageWithCaptionGraphAPI } = require('../controllers/post.ig.graph.controller');
const { updateIsMintedFlag } = require('../controllers/mint.image.controller');
const { updateMintForMultipleFlag } = require('../controllers/mint.multiple.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/ping', postPing);
router.post('/caption-image', upload.single('image'), postImageWithCaptionPrivateApi);
router.post('/caption-image-url', postImageUrlWithCaptionPrivateApi);
router.post('/graph-caption-image', upload.single('image'), postImageWithCaptionGraphAPI);
router.post('/private-user-profile-insight', getUserProfileInfoAndInsightsWithPrivateApi);
router.post('/private-hashtag', trackHashtagWithPrivateApi);
router.post('/mint-image', updateIsMintedFlag);
router.post('/mint-multiple', updateMintForMultipleFlag);

module.exports = router;