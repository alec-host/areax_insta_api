const express = require('express');

const { getMentionsWithGraphAPI, getMediaByHashtagsWithGraphAPI } = require('../controllers/get.ig.graph.controller');

const router = express.Router();

router.get('/graph-mentions',getMentionsWithGraphAPI);
router.get('/graph-hastags',getMediaByHashtagsWithGraphAPI);

module.exports = router;