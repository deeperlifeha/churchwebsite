const form = document.querySelector('#prayer-form');
const message = document.querySelector('#form-message');

form.addEventListener('submit', (event) => {
  for (const field of form.querySelectorAll('input[required]:not([type="checkbox"]), textarea[required]')) {
    field.value = field.value.trim();
  }
  if (!form.reportValidity()) {
    event.preventDefault();
    return;
  }
  // Use a normal POST so FormSubmit can show its CAPTCHA, activation, and result pages.
  // Never show a delivery confirmation before the mail service responds.
  message.textContent = 'Continue on the secure submission page to complete your request. If it does not load, return here and email the church directly.';
});
