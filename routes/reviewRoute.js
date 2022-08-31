const express = require('express');
const { restrictTo, protected } = require('../controllers/authController');
const {
  list,
  create,
  update,
  deleteReview,
  setTourAndUserId,
  show,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protected, list)
  .post(protected, restrictTo('user'), setTourAndUserId, create);

router
  .route('/:id')
  .get(show)
  .patch(protected, update)
  .delete(protected, deleteReview);

module.exports = router;
