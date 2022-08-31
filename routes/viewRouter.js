const express = require('express');
const sharp = require('sharp');
const multer = require('multer');

const {
  overview,
  tour,
  login,
  logout,
  profile,
  updateMe,
  myBooking,
} = require('../controllers/viewController');
const { protected, isLoggin } = require('../controllers/authController');
const { bookingCreate } = require('../controllers/bookingController');
const router = express.Router();

const storage = multer.memoryStorage();

const fileResizer = async (req, res, next) => {
  if (!req.file) return next();

  const dist = 'public/img/users/';
  const fileName = 'user-' + req.user.uuid + '-' + Date.now() + '.jpg';
  const filePath = dist + fileName;

  await sharp(req.file.buffer)
    .resize(300, 300)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(filePath);

  req.file.filename = fileName;
  next();
};
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users/');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = cb(
//       null,
//       'user' + '-' + Date.now() + '.' + file.mimetype.split('/')[1]
//     );
//   },
// });
function fileFilter(req, file, cb) {
  // You can always pass an error if something goes wrong:
  if (file.mimetype.split('/')[0] !== 'image') {
    cb(new Error('only image is permitted'));
  } else {
    console.log('valid image');
    cb(null, true);
  }
}

const upload = multer({ storage, fileFilter });

router.use(isLoggin);
router.get('/', bookingCreate, overview);
router.get('/my-booking', protected, myBooking);
router.get('/tour/:slug', protected, tour);

router.get('/me', protected, profile);
router.post(
  '/api/update-user',
  protected,
  upload.single('photo'),
  fileResizer,
  updateMe
);
router.get('/login', login);
router.get('/logout', protected, logout);

module.exports = router;
