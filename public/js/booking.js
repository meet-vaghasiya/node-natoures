/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
var stripe = Stripe(
  'pk_test_51JWb7oLkbJrjpOnqxavKMHzk649CvjZbXVEwMVUaawOmIwqEyLPfNcgApmeNPzaQpHvW2BqBO751kkkur7ty11gi00w7kdPNU0'
);

export const booking = async (tourId) => {
  try {
    const data = await axios.post(
      `http://localhost:3000/api/v1/booking/checkout/${tourId}`
    );

    console.log(data.data, 'pppppppppppp');

    if (data.data.status === 'success') {
      await stripe.redirectToCheckout({
        sessionId: data.data.session.id,
      });
      // showAlert(data.data.status, 'login success');
      // setTimeout(() => {
      //   location.assign('/');
      // }, 500);
    }
  } catch (err) {
    console.log(err.response);
    const { data } = err.response;
    showAlert(data.type, data.message);
  }
};
