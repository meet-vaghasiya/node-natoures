const express = require('express');
const { protected, restrictTo } = require('../controllers/authController');
const multer = require('multer');

const {
  listAllTours,
  createTour,
  showTour,
  updateTour,
  deleteTour,
  getToursStats,
} = require('../controllers/tourController');

const reviewRouter = require('./reviewRoute');

const { create } = require('../controllers/reviewController');
const sharp = require('sharp');

// multer config
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  // You can always pass an error if something goes wrong:
  if (file.mimetype.split('/')[0] !== 'image') {
    cb(new Error('only image is permitted'));
  } else {
    cb(null, true);
  }
}
const upload = multer({ limits: { fileSize: 10000000 }, storage, fileFilter });

const resizeImages = async (req, res, next) => {
  const dist = 'public/img/tours/';
  const fileName = 'tour-covor-' + req.user._id + '-' + Date.now() + '.jpg';
  const filePath = dist + fileName;

  await sharp(req.files.imageCover[0].buffer)
    .resize(1000, 1200)
    .toFormat('jpeg')
    .jpeg({
      quality: 80,
    })
    .toFile(filePath);

  req.body.imageCover = fileName;

  req.body.images = await Promise.all(
    req.files.images.map(async (image, i) => {
      const dist = 'public/img/tours/';

      const filename =
        'tour-' + i + '-' + req.user._id + '-' + Date.now() + '.jpg';
      await sharp(image.buffer)
        .resize(1000, 1200)
        .toFormat('jpeg')
        .jpeg({
          quality: 80,
        })
        .toFile(dist + filename)
        .catch((error) => console.log(error));
      return filename;
    })
  );

  next();
};

const router = express.Router();
router.use('/:tourId/review', reviewRouter);

router.route('/tour-states').get(getToursStats);

router.get('top-5-cheap', listAllTours);

router.route('/').get(listAllTours).post(createTour);

router
  .route(`/:id`)
  .get(protected, showTour)
  .patch(
    protected,
    restrictTo('admin', 'team-guide'),
    upload.fields([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 3 },
    ]),
    resizeImages,
    updateTour
  )
  .delete(protected, restrictTo('admin', 'team-guide'), deleteTour);

// router.post('/:tourId/review', protected, restrictTo('user'), create);

module.exports = router;
