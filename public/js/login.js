/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const data = await axios.post('http://localhost:3000/login', {
      email,
      password,
    });

    console.log(data.data);

    if (data.data.status === 'success') {
      showAlert(data.data.status, 'login success');
      setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    console.log(err.response);
    const { data } = err.response;
    showAlert(data.type, data.message);
  }
};

export const logout = async () => {
  try {
    const data = await axios.get('http://localhost:3000/logout');
    console.log(data, 'logout dat');
    if (data.data.type === 'success') {
      showAlert(data.data.status, 'logout successfully');
      location.assign('/');
    }
  } catch (err) {
    console.log(err.response);
  }
};
