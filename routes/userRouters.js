const express = require('express');
const { protected, restrictTo } = require('../controllers/authController');

const User = require('./../models/userModal');

const {
  list,
  create,
  showUser,
  updateUser,
  deleteUser,
  filterBody,
  showMe,
} = require(`../controllers/userController`);
const router = express.Router();

router
  .route('/')
  .get(protected, restrictTo('admin'), list)
  .post(create)
  .patch(protected, filterBody, updateUser);

router.use(protected);

router.delete('/deleteMe', deleteUser);
router.get('/me', showMe, showUser);

router
  .route(`/:id`)
  .get(showUser)
  .patch(updateUser)

  .delete(deleteUser);

module.exports = router;
