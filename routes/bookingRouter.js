const express = require('express');
const { protected } = require('../controllers/authController');

const User = require('./../models/userModal');

const { checkout } = require('../controllers/bookingController');

const router = express.Router();

router.post('/checkout/:tourId', protected, checkout);

module.exports = router;
