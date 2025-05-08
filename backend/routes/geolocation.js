const express = require('express');
const router = express.Router();
const { saveGeolocation } = require('../controllers/geolocationController');

router.post('/save-geolocation', saveGeolocation);
module.exports = router;
