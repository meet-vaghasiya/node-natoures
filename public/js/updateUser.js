import axios from 'axios';

import { showAlert } from './alert';

export const updateUser = async (type, body) => {
  let url = '/api/update-user';

  if (type === 'password') {
    url = '/api/update-password';
  }

  try {
    const data = await axios.post(url, body);

    if (data.data.status === 'success') {
      showAlert(data.data.status, 'Updated successfully');
      setTimeout(() => {
        location.reload();
      }, 500);
    }
  } catch (error) {
    console.log(err.response);
    const { data } = err.response;
    showAlert(data.type, data.message);
  }
};
