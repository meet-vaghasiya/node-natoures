const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protected,
} = require('../controllers/authController');

const router = express.Router();
router.post('/api/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.post('/api/update-password', protected, updatePassword);
router.post('/resetPassword/:token', resetPassword);

module.exports = router;
