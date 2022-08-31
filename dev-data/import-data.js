const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const User = require('../models/userModal');
const Review = require('../models/reviewModal');

dotenv.config({ path: './config.env' });

const Tour = require(`${__dirname}/../models/toursModal`);
const filePath = `${__dirname}/data/tours.json`;
const userFilePath = `${__dirname}/data/users.json`;
const reviewFilePath = `${__dirname}/data/reviews.json`;
const rawFile = fs.readFileSync(filePath, 'utf-8');
const userRawFile = fs.readFileSync(userFilePath, 'utf-8');
const reviewRawFile = fs.readFileSync(reviewFilePath, 'utf-8');

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    autoIndex: true,
  })
  .then((connection) => {
    console.log('database from import-data tour is connected');
  })
  .catch((err) => {
    console.log(err.message);
  });

async function createTours() {
  try {
    await User.create(JSON.parse(userRawFile));
    const tours = await Tour.init().then(async () => {
      await Tour.create(JSON.parse(rawFile));
    });
    await Review.create(JSON.parse(reviewRawFile));
  } catch (err) {
    console.log('Error from import-data.js', err.message);
  }
}

async function deleteTour() {
  try {
    const res = await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
  } catch (err) {
    console.log('Error from import-data.js', err.message);
  }
}
const [, , ...params] = process.argv;

async function performAction() {
  console.log(params);
  if (params.includes('--delete')) {
    await deleteTour();
  }
  if (params.includes('--create')) {
    await createTours();
  }
  if (params.includes('--reset')) {
    await deleteTour();
    await createTours();
  }
  process.exit();
}

if (params.length) {
  performAction();
}
