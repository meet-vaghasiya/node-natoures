const dotenv = require('dotenv');
const mongoose = require('mongoose').set('debug', true);
dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
  })
  .then((connection) => {
    console.log('data base connected');
  })
  .catch((err) => {
    console.log(err.message);
  });

const app = require('./app');
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`app is running on ${port}`);
});
