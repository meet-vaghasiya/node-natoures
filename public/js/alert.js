export const showAlert = (type, message) => {
  hideAlert();

  const alertEl = `<h3 class=" alert alert--${type}">${message}</h3>`;

  document.body.insertAdjacentHTML('beforeend', alertEl);

  setTimeout(() => {
    hideAlert();
  }, 3000);
};
const hideAlert = () => {
  const alertEl = document.getElementsByClassName('alert');
  if (alertEl.length) {
    console.log(alertEl, 'alertEL');
    alertEl[0].remove();
  }
};
