/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login.js';
import { updateUser } from './updateUser';
import { setMap } from './mapbox.js';
import { booking } from './booking.js';

const mapEl = document.getElementById('map');
const bookingEl = document.getElementById('book-now');

if (mapEl) {
  let locations = mapEl.dataset.locations;
  locations = JSON.parse(locations);
  if (locations) {
    setMap(locations);
  }
}

document.getElementById('form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});

const profileEl = document.getElementById('form-user-data');

profileEl?.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('email', document.getElementById('email').value);
  formData.append('name', document.getElementById('name').value);
  formData.append('photo', document.getElementById('photo').files[0]);
  console.log(formData, 'adfasdf');

  updateUser('user', formData);
});

const passwordForm = document.getElementById('form-user-settings');

passwordForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const password = document.getElementById('password-current').value;
  const newPassword = document.getElementById('password').value;
  const confirmPassword = document.getElementById('password-confirm').value;
  updateUser('password', {
    password,
    newPassword,
    confirmPassword,
  });
  document.getElementById('password-current').innerText = '';
  document.getElementById('password').innerText = '';
  document.getElementById('password-confirm').innerText = '';
});

if (bookingEl) {
  bookingEl.addEventListener('click', (e) => {
    const id = bookingEl.dataset.id;
    booking(id);
  });
}

document.getElementById('logout')?.addEventListener('click', logout);
