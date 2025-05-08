const express = require('express');
const router = express.Router();
const { saveScore, getScore } = require('../controllers/scoreController');

router.post('/save-score', saveScore);
router.get('/get-score', getScore);

module.exports = router;
